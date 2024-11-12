import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { TrashIcon } from '@heroicons/react/24/outline';
import FileUpload from './FileUpload';

export default function Files() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const { data, error } = await supabase
        .from('files')
        .select('*')
        .order('upload_date', { ascending: false });

      if (error) throw error;
      setFiles(data || []);
    } catch (error) {
      console.error('Error fetching files:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const { error } = await supabase
        .from('files')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      if (selectedFile?.id === id) {
        setSelectedFile(null);
      }
      
      fetchFiles();
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  const tableRow = (file) => (
    <tr key={file.id}>
      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">{file.filename}</td>
      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{file.file_size}</td>
      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
        {new Date(file.upload_date).toLocaleDateString()}
      </td>
      <td className="whitespace-nowrap px-3 py-4 text-sm">
        <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
          file.status === 'Completed' 
            ? 'bg-green-100 text-green-800'
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          {file.status}
        </span>
      </td>
      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{file.trades}</td>
      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
        <button
          onClick={() => setSelectedFile(file)}
          className="inline-flex items-center rounded-full bg-green-600 px-3 py-1 text-sm font-semibold text-white hover:bg-green-700 mr-2"
        >
          View<span className="sr-only">, {file.filename}</span>
        </button>
        <button
          onClick={() => handleDelete(file.id)}
          className="inline-flex items-center rounded-full bg-red-600 px-3 py-1 text-sm font-semibold text-white hover:bg-red-700"
        >
          <TrashIcon className="h-4 w-4" />
          <span className="sr-only">Delete {file.filename}</span>
        </button>
      </td>
    </tr>
  );

  return (
    <div className="p-6">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Trading Files</h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all trading data files uploaded to the platform.
          </p>
        </div>
      </div>

      <div className="mt-8">
        <FileUpload onUploadComplete={fetchFiles} />
      </div>

      <div className="mt-8 flex flex-col">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              {loading ? (
                <div className="p-4 text-center">Loading...</div>
              ) : (
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">File Name</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Size</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Upload Date</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Trades</th>
                      <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {files.map(file => tableRow(file))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>

      {selectedFile && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity">
          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl sm:p-6">
                <div className="absolute right-0 top-0 pr-4 pt-4">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500"
                    onClick={() => setSelectedFile(null)}
                  >
                    <span className="sr-only">Close</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left">
                    <h3 className="text-lg font-semibold leading-6 text-gray-900">
                      File Details: {selectedFile.filename}
                    </h3>
                    <div className="mt-4">
                      <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                        <table className="min-w-full divide-y divide-gray-300">
                          <thead className="bg-gray-50 sticky top-0">
                            <tr>
                              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Trade Date</th>
                              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Symbol</th>
                              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Type</th>
                              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Quantity</th>
                              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Price</th>
                              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Counterparty</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 bg-white">
                            {selectedFile.sample_trades?.map((trade, index) => (
                              <tr key={index}>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">{trade.date}</td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">{trade.symbol}</td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">{trade.type}</td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">{trade.quantity}</td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">${trade.price}</td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">{trade.counterparty}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}