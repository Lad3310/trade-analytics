import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import FileUpload from '../components/FileUpload';

export default function Dashboard() {
  const [recentFiles, setRecentFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentFiles();
  }, []);

  const fetchRecentFiles = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('files')
        .select('*')
        .order('upload_date', { ascending: false })
        .limit(5);

      if (error) throw error;
      setRecentFiles(data.map(file => ({
        id: file.id,
        name: file.filename,
        uploadDate: new Date(file.upload_date).toLocaleDateString(),
        size: file.file_size,
        status: file.status
      })));
    } catch (error) {
      console.error('Error fetching files:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Dashboard</h1>
        
        {/* File Upload Section */}
        <div className="mt-6 sm:mt-8">
          <FileUpload onUploadComplete={fetchRecentFiles} />
        </div>

        {/* Recent Uploads Section */}
        <div className="mt-8 sm:mt-10">
          <h2 className="text-base sm:text-lg font-medium text-gray-900">Recent Uploads</h2>
          
          {loading ? (
            <div className="mt-4 text-center text-gray-500">Loading...</div>
          ) : recentFiles.length === 0 ? (
            <div className="mt-4 text-center text-gray-500">No files uploaded yet</div>
          ) : (
            <div className="mt-4">
              <div className="overflow-x-auto">
                <div className="inline-block min-w-full align-middle">
                  <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                    {/* Mobile View */}
                    <div className="block sm:hidden">
                      {recentFiles.map((file) => (
                        <div key={file.id} className="bg-white px-4 py-3 border-b border-gray-200">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{file.name}</div>
                              <div className="text-xs text-gray-500 mt-1">{file.uploadDate}</div>
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
                          <div className="text-xs text-gray-500 mt-1">Size: {file.size}</div>
                        </div>
                      ))}
                    </div>

                    {/* Desktop View */}
                    <table className="hidden sm:table min-w-full divide-y divide-gray-300">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sm:px-6">File Name</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sm:px-6">Upload Date</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sm:px-6">Size</th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sm:px-6">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {recentFiles.map((file) => (
                          <tr key={file.id}>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900 sm:px-6">{file.name}</td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 sm:px-6">{file.uploadDate}</td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 sm:px-6">{file.size}</td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm sm:px-6">
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
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}