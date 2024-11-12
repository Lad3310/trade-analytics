import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';

export default function Analytics() {
  const [stats, setStats] = useState({
    totalFiles: 0,
    successRate: 0,
    avgProcessTime: 0,
    avgFileSize: 0,
    fileTypes: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const { data, error } = await supabase
        .from('files')
        .select('*');

      if (error) throw error;

      // Calculate statistics
      const totalFiles = data.length;
      const completedFiles = data.filter(f => f.status === 'Completed').length;
      const successRate = totalFiles ? ((completedFiles / totalFiles) * 100).toFixed(1) : 0;
      
      // Calculate average file size
      const totalSize = data.reduce((acc, file) => {
        const size = parseFloat(file.file_size.replace(' KB', ''));
        return acc + size;
      }, 0);
      const avgFileSize = totalFiles ? (totalSize / totalFiles).toFixed(1) : 0;

      // Group by file type
      const typeStats = data.reduce((acc, file) => {
        const type = file.file_type.toUpperCase();
        if (!acc[type]) {
          acc[type] = {
            count: 0,
            totalSize: 0,
            successful: 0
          };
        }
        acc[type].count++;
        acc[type].totalSize += parseFloat(file.file_size.replace(' KB', ''));
        if (file.status === 'Completed') acc[type].successful++;
        return acc;
      }, {});

      const fileTypes = Object.entries(typeStats).map(([type, stats]) => ({
        type,
        files: stats.count,
        avgSize: (stats.totalSize / stats.count).toFixed(1),
        successRate: ((stats.successful / stats.count) * 100).toFixed(1)
      }));

      setStats({
        totalFiles,
        successRate,
        avgProcessTime: '1.85s', // This would need backend processing time tracking
        avgFileSize,
        fileTypes
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading analytics...</div>;

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-gray-900">File Analytics</h2>
      <p className="mt-2 text-sm text-gray-700">File processing metrics and upload statistics.</p>

      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500">Total Files</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.totalFiles}</dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500">Success Rate</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.successRate}%</dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500">Avg Process Time</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.avgProcessTime}</dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500">Avg File Size</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.avgFileSize} KB</dd>
          </div>
        </div>
      </div>

      <h3 className="mt-8 text-lg font-medium text-gray-900">File Types</h3>
      <div className="mt-4">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Type</th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Files</th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Avg Size</th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Success Rate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {stats.fileTypes.map((type) => (
              <tr key={type.type}>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">{type.type}</td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{type.files}</td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{type.avgSize} KB</td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-green-600">{type.successRate}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}