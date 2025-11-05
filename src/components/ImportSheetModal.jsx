import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { Upload, FileText, Download, Loader2 } from 'lucide-react';

const ImportSheetModal = ({ open, onOpenChange }) => {
  const [file, setFile] = useState(null);
  const [importType, setImportType] = useState('businesses');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const parseCSV = (csvText) => {
    const lines = csvText.split(/\r?\n/).filter(line => line.trim() !== '');
    if (lines.length < 2) return [];
    const headers = lines[0].split(',').map(h => h.trim());
    return lines.slice(1).map(line => {
      const values = line.split(',');
      return headers.reduce((obj, header, index) => {
        obj[header] = values[index] ? values[index].trim() : '';
        return obj;
      }, {});
    });
  };

  const handleImport = async () => {
    if (!file) {
      toast({ title: 'No file selected', description: 'Please choose a CSV file to import.', variant: 'destructive' });
      return;
    }

    setLoading(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const csvText = event.target.result;
      const data = parseCSV(csvText);

      if (data.length === 0) {
        toast({ title: 'Empty or invalid file', description: 'The CSV file appears to be empty or formatted incorrectly.', variant: 'destructive' });
        setLoading(false);
        return;
      }
      
      let error = null;
      let insertedCount = 0;

      if (importType === 'businesses') {
        const businesses = data.map(row => ({
          name: row.name,
          category: row.category,
          district: row.district,
          phone: row.phone,
          email: row.email,
          website: row.website,
          address: row.address,
        }));
        const { error: insertError, count } = await supabase.from('businesses').insert(businesses);
        error = insertError;
        insertedCount = count;
      } else if (importType === 'products') {
        const products = data.map(row => ({
            name: row.name,
            manufacturer: row.manufacturer,
            spec: row.spec,
            category: row.category,
            subcategory: row.subcategory,
            image_url: row.image_url || null,
        }));
        const { error: insertError, count } = await supabase.from('products').insert(products);
        error = insertError;
        insertedCount = count;
      }

      setLoading(false);
      onOpenChange(false);
      setFile(null);

      if (error) {
        toast({ title: 'Import failed', description: `An error occurred: ${error.message}`, variant: 'destructive' });
      } else {
        toast({ title: 'Import successful!', description: `Successfully imported ${insertedCount || data.length} records.` });
      }
    };
    reader.readAsText(file);
  };
  
  const downloadTemplate = (type) => {
    let headers, filename;
    if (type === 'businesses') {
        headers = "name,category,district,phone,email,website,address";
        filename = "services_template.csv";
    } else {
        headers = "name,manufacturer,spec,category,subcategory,image_url";
        filename = "products_template.csv";
    }
    const blob = new Blob([headers], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-6 w-6" /> Import from Google Sheet
          </DialogTitle>
          <DialogDescription>
            Export your Google Sheet as a CSV file, then upload it here to bulk-add data.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-2">
                <Button variant={importType === 'businesses' ? 'default' : 'outline'} onClick={() => setImportType('businesses')}>Services</Button>
                <Button variant={importType === 'products' ? 'default' : 'outline'} onClick={() => setImportType('products')}>Products</Button>
            </div>

            <div className="p-4 bg-gray-100 rounded-lg text-sm text-gray-700 space-y-3">
                <p>To ensure a successful import, please use our template:</p>
                <Button variant="link" className="p-0 h-auto" onClick={() => downloadTemplate(importType)}>
                    <Download className="mr-2 h-4 w-4" />
                    Download {importType === 'businesses' ? 'Services' : 'Products'} CSV Template
                </Button>
            </div>
            
            <div>
                <label htmlFor="file-upload" className="flex items-center justify-center w-full h-32 px-4 transition bg-white border-2 border-gray-300 border-dashed rounded-md appearance-none cursor-pointer hover:border-gray-400 focus:outline-none">
                    {file ? (
                        <div className="text-center">
                            <FileText className="mx-auto h-8 w-8 text-emerald-500"/>
                            <p className="font-semibold">{file.name}</p>
                            <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                        </div>
                    ) : (
                        <span className="flex items-center space-x-2">
                            <Upload className="h-6 w-6 text-gray-600"/>
                            <span className="font-medium text-gray-600">
                                Drop files to attach, or <span className="text-emerald-600 underline">browse</span>
                            </span>
                        </span>
                    )}
                </label>
                <Input id="file-upload" type="file" accept=".csv" onChange={handleFileChange} className="sr-only" />
            </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
          <Button onClick={handleImport} disabled={!file || loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
            Import Data
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImportSheetModal;