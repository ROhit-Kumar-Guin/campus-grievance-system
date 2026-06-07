import { useState } from 'react';
import { uploadResource } from '../../api/resource.api.js';
import toast from 'react-hot-toast';
import { IconX, IconUpload, IconFile } from '@tabler/icons-react';

const DEPARTMENTS = [
  'Computer Science & Engineering',
  'Electronics & Communication Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Electrical Engineering',
  'Information Technology',
];

const UploadResourceModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title:       '',
    description: '',
    department:  '',
    subject:     '',
    type:        'Notes',
  });
  const [file, setFile]         = useState(null);
  const [loading, setLoading]   = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleChange = (e) => {
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) return toast.error('Please select a file to upload');
    if (!formData.title)      return toast.error('Please enter a title');
    if (!formData.department) return toast.error('Please select a department');
    if (!formData.subject)    return toast.error('Please enter a subject');

    setLoading(true);
    try {
      // Use FormData to send file + text fields together
      const data = new FormData();
      data.append('file',        file);
      data.append('title',       formData.title);
      data.append('description', formData.description);
      data.append('department',  formData.department);
      data.append('subject',     formData.subject);
      data.append('type',        formData.type);

      await uploadResource(data);
      toast.success('Resource uploaded successfully!');
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    /* Backdrop */
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg border border-gray-100 dark:border-slate-800">

        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-slate-800">
          <div>
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
              Upload Resource
            </h3>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
              PDF, DOC, PPT up to 10MB
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition"
          >
            <IconX size={16} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">

          {/* File drop zone */}
          <div
            onDrop={handleFileDrop}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onClick={() => document.getElementById('file-input').click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition ${
              dragOver
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950'
                : file
                  ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-950'
                  : 'border-gray-200 dark:border-slate-700 hover:border-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30'
            }`}
          >
            <input
              id="file-input"
              type="file"
              className="hidden"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
              onChange={(e) => setFile(e.target.files[0])}
            />
            {file ? (
              <div className="flex items-center justify-center gap-2">
                <IconFile size={20} className="text-emerald-600" />
                <div>
                  <div className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                    {file.name}
                  </div>
                  <div className="text-xs text-emerald-600 dark:text-emerald-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </div>
                </div>
              </div>
            ) : (
              <>
                <IconUpload size={24} className="text-gray-400 mx-auto mb-2" />
                <div className="text-sm text-gray-600 dark:text-slate-400">
                  Drag & drop or <span className="text-indigo-600 dark:text-indigo-400">browse</span>
                </div>
                <div className="text-xs text-gray-400 dark:text-slate-500 mt-1">
                  PDF, DOC, DOCX, PPT, PPTX
                </div>
              </>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1.5">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Data Structures PYQ 2023"
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>

          {/* Department + Subject row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1.5">
                Department <span className="text-red-500">*</span>
              </label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              >
                <option value="">Select dept.</option>
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>{d.split(' ')[0]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1.5">
                Subject <span className="text-red-500">*</span>
              </label>
              <input
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="e.g. Data Structures"
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>
          </div>

          {/* Type + Description row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1.5">
                Type
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              >
                <option>Notes</option>
                <option>PYQ</option>
                <option>Syllabus</option>
                <option>Assignment</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-slate-400 mb-1.5">
                Description (optional)
              </label>
              <input
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Brief note about this file"
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border border-gray-200 dark:border-slate-700 text-sm text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2.5 rounded-lg transition disabled:opacity-60"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <IconUpload size={15} />
                  Upload
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadResourceModal;