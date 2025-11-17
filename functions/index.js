const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { google } = require('googleapis');

// Initialize Firebase Admin
admin.initializeApp();

// Load service account from file (download from Firebase Console)
const serviceAccount = require('./serviceAccount.json');

// Google Sheets API configuration
const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID || 'your_spreadsheet_id';
const SHEET_NAME = 'Users'; // Adjust to your sheet name

// JWT Client for Google Sheets API authentication
const jwtClient = new google.auth.JWT({
  email: serviceAccount.client_email,
  key: serviceAccount.private_key,
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

// Authorize the client
const jwtAuthPromise = jwtClient.authorize();

/**
 * Cloud Function: Check if user exists in Google Sheets and set custom claims
 */
exports.checkUserPermissions = functions.https.onCall(async (data, context) => {
  // Ensure user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated to check permissions.'
    );
  }

  const userEmail = context.auth.token.email;
  const userId = context.auth.uid;

  try {
    // Authenticate with Google Sheets
    await jwtAuthPromise;

    const sheets = google.sheets({ version: 'v4', auth: jwtClient });

    // Read data from Google Sheets
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:D`, // Columns: Email, Role, CanEdit, AccessLevel
    });

    const rows = response.data.values;

    if (!rows || rows.length === 0) {
      console.log('No data found in sheet');
      return { hasAccess: false, message: 'No users found in database' };
    }

    // Find user by email (assuming email is in column A)
    const userRow = rows.find(row => row[0] && row[0].toLowerCase() === userEmail.toLowerCase());

    if (!userRow) {
      console.log(`User ${userEmail} not found in sheet`);
      return { hasAccess: false, message: 'User not authorized' };
    }

    // Extract user data from sheet
    const userData = {
      email: userRow[0],
      role: userRow[1] || 'viewer', // Column B: Role (e.g., 'editor', 'admin', 'viewer')
      canEdit: userRow[2] === 'TRUE' || userRow[2] === 'true', // Column C: CanEdit (boolean)
      accessLevel: parseInt(userRow[3]) || 1 // Column D: AccessLevel (number)
    };

    // Set custom claims for the user
    await admin.auth().setCustomUserClaims(userId, {
      role: userData.role,
      canEdit: userData.canEdit,
      accessLevel: userData.accessLevel,
      verified: true
    });

    console.log(`Custom claims set for user ${userEmail}:`, userData);

    return {
      hasAccess: true,
      message: 'Access granted',
      userData: userData
    };

  } catch (error) {
    console.error('Error checking permissions:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to check user permissions',
      error.message
    );
  }
});

/**
 * Cloud Function: Update Google Sheets data (only for users with edit permissions)
 */
exports.updateSheetData = functions.https.onCall(async (data, context) => {
  // Ensure user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated.'
    );
  }

  // Check if user has edit permissions
  if (!context.auth.token.canEdit) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'User does not have edit permissions.'
    );
  }

  const { range, values } = data;

  if (!range || !values) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Range and values are required.'
    );
  }

  try {
    await jwtAuthPromise;

    const sheets = google.sheets({ version: 'v4', auth: jwtClient });

    // Update the sheet
    const response = await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: range,
      valueInputOption: 'USER_ENTERED',
      resource: { values: values }
    });

    console.log(`Sheet updated: ${response.data.updatedCells} cells updated`);

    return {
      success: true,
      updatedCells: response.data.updatedCells,
      updatedRange: response.data.updatedRange
    };

  } catch (error) {
    console.error('Error updating sheet:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to update sheet data',
      error.message
    );
  }
});

/**
 * Cloud Function: Read Google Sheets data
 */
exports.readSheetData = functions.https.onCall(async (data, context) => {
  // Ensure user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated.'
    );
  }

  const { range } = data;

  if (!range) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Range is required.'
    );
  }

  try {
    await jwtAuthPromise;

    const sheets = google.sheets({ version: 'v4', auth: jwtClient });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: range
    });

    return {
      success: true,
      data: response.data.values || []
    };

  } catch (error) {
    console.error('Error reading sheet:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to read sheet data',
      error.message
    );
  }
});

/**
 * Cloud Function: Triggered when a new user signs up
 * Automatically checks if they exist in the sheet
 */
exports.onUserCreate = functions.auth.user().onCreate(async (user) => {
  const userEmail = user.email;

  try {
    await jwtAuthPromise;

    const sheets = google.sheets({ version: 'v4', auth: jwtClient });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:D`,
    });

    const rows = response.data.values;

    if (!rows || rows.length === 0) {
      console.log('No data found in sheet');
      return null;
    }

    const userRow = rows.find(row => row[0] && row[0].toLowerCase() === userEmail.toLowerCase());

    if (userRow) {
      const userData = {
        role: userRow[1] || 'viewer',
        canEdit: userRow[2] === 'TRUE' || userRow[2] === 'true',
        accessLevel: parseInt(userRow[3]) || 1
      };

      // Set custom claims
      await admin.auth().setCustomUserClaims(user.uid, {
        role: userData.role,
        canEdit: userData.canEdit,
        accessLevel: userData.accessLevel,
        verified: true
      });

      console.log(`Custom claims automatically set for new user ${userEmail}`);
    } else {
      console.log(`New user ${userEmail} not found in authorized users sheet`);
    }

    return null;
  } catch (error) {
    console.error('Error in onUserCreate:', error);
    return null;
  }
});
