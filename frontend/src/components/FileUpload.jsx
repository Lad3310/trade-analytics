import { useState, useRef } from 'react';
import { supabase } from '../config/supabase';

export default function FileUpload({ onUploadComplete }) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Previous functions remain the same until handleFileUpload
  const validateXMLFile = (file) => {
    if (!file.name.endsWith('.xml')) {
      throw new Error('Only XML files are accepted');
    }
    if (file.size > 50 * 1024 * 1024) {
      throw new Error('File size exceeds 50MB limit');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      await handleFileUpload(files[0]);
    }
  };

  const handleFileUpload = async (file) => {
    let data;
    try {
      setUploadError(null);
      setIsUploading(true);
      validateXMLFile(file);
  
      const fileContent = await file.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(fileContent, "text/xml");
      
      if (xmlDoc.getElementsByTagName("parsererror").length > 0) {
        throw new Error('Invalid XML file format');
      }
  
      const trades = xmlDoc.getElementsByTagName("trade").length;
      const tradeElements = xmlDoc.getElementsByTagName("trade");
      const parsedTrades = Array.from(tradeElements).map(trade => ({
        date: trade.getElementsByTagName("date")[0]?.textContent,
        symbol: trade.getElementsByTagName("symbol")[0]?.textContent,
        type: trade.getElementsByTagName("type")[0]?.textContent,
        quantity: parseInt(trade.getElementsByTagName("quantity")[0]?.textContent || '0'),
        price: parseFloat(trade.getElementsByTagName("price")[0]?.textContent || '0'),
        counterparty: trade.getElementsByTagName("counterparty")[0]?.textContent
      }));

      const fileSizeInKB = (file.size / 1024).toFixed(2);
const { data: insertData, error } = await supabase
  .from('files')
  .insert([
    {
      filename: file.name,
      status: 'Processing',
      file_type: 'xml',
      file_size: `${fileSizeInKB} KB`,
      file_content: fileContent,
      trades: trades,
      sample_trades: parsedTrades,
      upload_date: new Date().toISOString()
    }
  ])
  .select();

      data = insertData;
  
      if (error) {
        if (error.code === '42P01') {
          throw new Error('Database table not properly configured. Please contact support.');
        }
        throw error;
      }
  
      const { error: updateError } = await supabase
        .from('files')
        .update({ status: 'Completed' })
        .eq('id', data[0].id);
  
      if (updateError) {
        throw updateError;
      }
  
      onUploadComplete();
  
    } catch (error) {
      setUploadError(error.message);
      console.error('Error uploading file:', error);
      
      if (data?.[0]?.id) {
        await supabase
          .from('files')
          .update({ status: 'Failed' })
          .eq('id', data[0].id);
      }
    } finally {
      setIsUploading(false);
    }
  };

  // Rest of the component remains the same
  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      await handleFileUpload(files[0]);
    }
  };

  return (
    <div>
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer ${
          isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
        } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileSelect}
          accept=".xml"
          disabled={isUploading}
        />
        <div className="flex flex-col items-center">
          {isUploading ? (
            <p className="text-gray-600">Uploading...</p>
          ) : (
            <>
              <p className="text-gray-600">Click to upload or drag and drop</p>
              <p className="text-sm text-gray-500 mt-1">XML files only, maximum size 50 MB</p>
            </>
          )}
        </div>
      </div>
      {uploadError && (
        <div className="mt-2 text-sm text-red-600">
          Error: {uploadError}
        </div>
      )}
    </div>
  );
}