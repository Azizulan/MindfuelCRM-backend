import React, { useState, useCallback } from 'react';
import { UploadIcon } from './icons/UploadIcon';
import * as api from '../services/apiService';
import { processAndAnalyzeData } from '../utils/dataProcessor';

declare const Papa: any;
declare const XLSX: any;

interface DataUploadPageProps {
  onUploadSuccess: () => void;
}

const DataUploadPage: React.FC<DataUploadPageProps> = ({ onUploadSuccess }) => {
  const [fileName, setFileName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleDataLoaded = async (data: any[]) => {
      setIsLoading(true);
      setError(null);
      setSuccess(null);
      try {
          const processedData = processAndAnalyzeData(data);
          const response = await api.uploadCustomers(processedData);
          setSuccess(response.message);
          onUploadSuccess();
          setFileName(null);
      } catch (err: any) {
          setError(err.message);
      } finally {
          setIsLoading(false);
      }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      parseFile(file);
    }
  };

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const file = event.dataTransfer.files?.[0];
    if (file) {
      parseFile(file);
    }
  }, []);

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const parseFile = (file: File) => {
    setFileName(file.name);
    
    if (file.name.endsWith('.csv')) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results: any) => handleDataLoaded(results.data),
        error: (err: any) => setError(`PapaParse error: ${err.message}`)
      });
    } else if (file.name.endsWith('.xlsx')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const json = XLSX.utils.sheet_to_json(worksheet);
          handleDataLoaded(json);
        } catch (err: any) {
          setError(`XLSX parsing error: ${err.message}`);
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white p-8 rounded-lg shadow-md border border-slate-200 text-center">
        <h2 className="text-2xl font-semibold mb-2 text-slate-700">Upload and Process Data</h2>
        <p className="text-slate-500 mb-6">Upload a file to overwrite all existing customer data in the database.</p>
        
        <div 
          onDrop={handleDrop} 
          onDragOver={handleDragOver}
          className="border-2 border-dashed border-slate-300 rounded-lg p-10 cursor-pointer hover:border-blue-500 hover:bg-slate-50 transition-colors"
        >
          <input
            type="file"
            id="file-upload"
            className="hidden"
            accept=".csv, .xlsx"
            onChange={handleFileChange}
          />
          <label htmlFor="file-upload" className="flex flex-col items-center space-y-4 cursor-pointer">
            <UploadIcon />
            {isLoading ? (
                <p className="text-slate-600">Processing and uploading...</p>
            ) : fileName ? (
                <p className="text-slate-600 font-medium">{fileName}</p>
            ) : (
              <p className="text-slate-600">
                <span className="font-semibold text-blue-600">Click to upload</span> or drag and drop
              </p>
            )}
            <p className="text-xs text-slate-400">CSV or Excel (.xlsx) files only.</p>
          </label>
        </div>
        
        {error && <p className="mt-4 text-sm text-red-600 bg-red-100 p-3 rounded-md">{error}</p>}
        {success && <p className="mt-4 text-sm text-green-600 bg-green-100 p-3 rounded-md">{success}</p>}
        
        <div className="mt-8 text-left text-sm text-slate-500 bg-slate-100 p-4 rounded-md">
          <h4 className="font-semibold text-slate-600 mb-2">Required File Columns:</h4>
          <ul className="list-disc list-inside space-y-1">
            <li><code className="bg-slate-200 px-1 rounded">name</code></li>
            <li><code className="bg-slate-200 px-1 rounded">purchase date</code> (e.g., "2023-10-27")</li>
            <li><code className="bg-slate-200 px-1 rounded">phone</code> and/or <code className="bg-slate-200 px-1 rounded">email</code></li>
            <li><code className="bg-slate-200 px-1 rounded">address</code>, <code className="bg-slate-200 px-1 rounded">product</code>, <code className="bg-slate-200 px-1 rounded">product price</code></li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DataUploadPage;
