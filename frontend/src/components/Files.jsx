import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import FileUpload from './FileUpload';
import { TrashIcon } from '@heroicons/react/24/outline';
import FileDetailsModal from './FileDetailsModal';

export default function Files() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('files')
        .select('*')
        .order('upload_date', { ascending: false });

      if (error) throw error;
      setFiles(data);
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
      fetchFiles();
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Trading Files</h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all trading data files uploaded to the platform.
          </p>
        </div>
      </div>

      <div className="mt-6">
        <FileUpload onUploadComplete={fetchFiles} />
      </div>

      <div className="mt-6">
        {loading ? (
          <div className="text-center p-4">Loading...</div>
        ) : (
          <>
            {/* Mobile View */}
            <div className="block sm:hidden">
              {files.map((file) => (
                <div key={file.id} className="bg-white rounded-lg shadow mb-4">
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{file.filename}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(file.upload_date).toLocaleDateString()}
                        </div>
                      </div>
                      <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                        file.status === 'Completed' 
                          ? 'bg-green-100 text-green-800'
                          : file.status === 'Failed'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {file.status}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">Size: {file.file_size}</div>
                    <div className="mt-3 flex justify-end space-x-2">
                      <button
                        onClick={() => setSelectedFile(file)}
                        className="inline-flex items-center rounded-full bg-green-600 px-3 py-1 text-xs font-semibold text-white"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleDelete(file.id)}
                        className="inline-flex items-center rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop View */}
            <div className="hidden sm:block overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">File Name</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Size</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Upload Date</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {files.map((file) => (
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
                            : file.status === 'Failed'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {file.status}
                        </span>
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <button
                          onClick={() => setSelectedFile(file)}
                          className="inline-flex items-center rounded-full bg-green-600 px-3 py-1 text-sm font-semibold text-white hover:bg-green-700 mr-2"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleDelete(file.id)}
                          className="inline-flex items-center rounded-full bg-red-600 px-3 py-1 text-sm font-semibold text-white hover:bg-red-700"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {selectedFile && (
        <FileDetailsModal
          file={selectedFile}
          onClose={() => setSelectedFile(null)}
        />
      )}
    </div>
  );
}