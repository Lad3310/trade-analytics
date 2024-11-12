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
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <div className="mt-8">
          <FileUpload onUploadComplete={fetchRecentFiles} />
        </div>
        <div className="mt-10">
          <h2 className="text-lg font-medium text-gray-900">Recent Uploads</h2>
          {loading ? (
            <div>Loading...</div>
          ) : (
            <div className="mt-4">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">File Name</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Upload Date</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Size</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {recentFiles.map((file) => (
                      <tr key={file.id}>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">{file.name}</td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{file.uploadDate}</td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{file.size}</td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm">
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
          )}
        </div>
      </div>
    </div>
  );
}