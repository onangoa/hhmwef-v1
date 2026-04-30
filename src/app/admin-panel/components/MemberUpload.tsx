'use client';

import React, { useState, useRef, useCallback } from 'react';
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Download,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Users,
  AlertTriangle,
} from 'lucide-react';

interface ParsedMember {
  rowIndex: number;
  firstName: string;
  lastName: string;
  idNumber: string;
  ministry: string;
  department: string;
  payrollNumber: string;
  phone: string;
  email: string;
  status: 'valid' | 'error';
  errors: string[];
}

interface UploadSummary {
  total: number;
  valid: number;
  errors: number;
}

const REQUIRED_COLUMNS = [
  'First Name',
  'Last Name',
  'ID Number',
  'Ministry',
  'Department',
  'Payroll Number',
  'Phone',
  'Email',
];

const SAMPLE_CSV = `First Name,Last Name,ID Number,Ministry,Department,Payroll Number,Phone,Email
Alice,Kariuki,30123456,Ministry of Health,State Dept. of Medical Services,PR/2026/00201,0712000001,alice.kariuki@health.go.ke
Brian,Omondi,30234567,Ministry of Education,State Dept. of Basic Education,PR/2026/00202,0723000002,brian.omondi@education.go.ke
Clara,Waweru,30345678,Ministry of Finance & Economic Planning,State Dept. of National Treasury,PR/2026/00203,0734000003,clara.waweru@treasury.go.ke
Daniel,Maina,30456789,Ministry of Agriculture,State Dept. of Crop Development,PR/2026/00204,0745000004,daniel.maina@agriculture.go.ke
Eva,Njoki,30567890,Ministry of ICT & Digital Economy,State Dept. of ICT,PR/2026/00205,0756000005,eva.njoki@ict.go.ke`;

function parseCSV(text: string): { headers: string[]; rows: string[][] } {
  const lines = text
    .trim()
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length === 0) return { headers: [], rows: [] };
  const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
  const rows = lines
    .slice(1)
    .map((line) => line.split(',').map((cell) => cell.trim().replace(/^"|"$/g, '')));
  return { headers, rows };
}

function validateRow(row: string[], headers: string[], rowIndex: number): ParsedMember {
  const get = (col: string) => {
    const idx = headers.indexOf(col);
    return idx >= 0 ? (row[idx] || '').trim() : '';
  };

  const errors: string[] = [];
  const firstName = get('First Name');
  const lastName = get('Last Name');
  const idNumber = get('ID Number');
  const ministry = get('Ministry');
  const department = get('Department');
  const payrollNumber = get('Payroll Number');
  const phone = get('Phone');
  const email = get('Email');

  if (!firstName) errors.push('First Name is required');
  if (!lastName) errors.push('Last Name is required');
  if (!idNumber) errors.push('ID Number is required');
  else if (!/^\d{7,8}$/.test(idNumber)) errors.push('ID Number must be 7-8 digits');
  if (!ministry) errors.push('Ministry is required');
  if (!department) errors.push('Department is required');
  if (!payrollNumber) errors.push('Payroll Number is required');
  if (!phone) errors.push('Phone is required');
  else if (!/^0[17]\d{8}$/.test(phone)) errors.push('Phone must be a valid Kenyan number');
  if (!email) errors.push('Email is required');
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('Email is invalid');

  return {
    rowIndex,
    firstName,
    lastName,
    idNumber,
    ministry,
    department,
    payrollNumber,
    phone,
    email,
    status: errors.length === 0 ? 'valid' : 'error',
    errors,
  };
}

export default function MemberUpload() {
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState('');
  const [parsedMembers, setParsedMembers] = useState<ParsedMember[]>([]);
  const [summary, setSummary] = useState<UploadSummary | null>(null);
  const [headerErrors, setHeaderErrors] = useState<string[]>([]);
  const [importDone, setImportDone] = useState(false);
  const [expandedErrors, setExpandedErrors] = useState<number[]>([]);
  const [filterMode, setFilterMode] = useState<'all' | 'valid' | 'error'>('all');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback((file: File) => {
    if (!file) return;
    setFileName(file.name);
    setImportDone(false);
    setExpandedErrors([]);
    setFilterMode('all');

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const { headers, rows } = parseCSV(text);

      const missingCols = REQUIRED_COLUMNS.filter((col) => !headers.includes(col));
      if (missingCols.length > 0) {
        setHeaderErrors([`Missing required columns: ${missingCols.join(', ')}`]);
        setParsedMembers([]);
        setSummary(null);
        return;
      }
      setHeaderErrors([]);

      const members = rows.map((row, i) => validateRow(row, headers, i + 2));
      const valid = members.filter((m) => m.status === 'valid').length;
      const errors = members.filter((m) => m.status === 'error').length;
      setParsedMembers(members);
      setSummary({ total: members.length, valid, errors });
    };
    reader.readAsText(file);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (
        file &&
        (file.name.endsWith('.csv') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))
      ) {
        processFile(file);
      }
    },
    [processFile]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleImport = async () => {
    const validMembers = parsedMembers.filter((m) => m.status === 'valid');

    if (validMembers.length === 0) {
      return;
    }

    try {
      const response = await fetch('/api/members/bulk-upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          members: validMembers.map((m) => ({
            firstName: m.firstName,
            lastName: m.lastName,
            idNumber: m.idNumber,
            ministry: m.ministry,
            stateDepartment: m.department,
            payrollNumber: m.payrollNumber,
            phoneNumber: m.phone,
            email: m.email,
          })),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setImportDone(true);
      } else {
        alert(data.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
    }
  };

  const handleReset = () => {
    setFileName('');
    setParsedMembers([]);
    setSummary(null);
    setHeaderErrors([]);
    setImportDone(false);
    setExpandedErrors([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const downloadSample = () => {
    const blob = new Blob([SAMPLE_CSV], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'member_upload_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleErrorExpand = (idx: number) => {
    setExpandedErrors((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  const displayedMembers =
    filterMode === 'all' ? parsedMembers : parsedMembers.filter((m) => m.status === filterMode);

  return (
    <div className="p-4 lg:p-6 xl:p-8 max-w-screen-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Bulk Member Upload</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Import members from a CSV or Excel file
          </p>
        </div>
        <button
          onClick={downloadSample}
          className="flex items-center gap-2 text-sm font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-4 py-2 rounded-lg transition-all duration-150"
        >
          <Download size={15} />
          Download Template
        </button>
      </div>

      {/* Upload Zone */}
      {!summary && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 mb-6 ${
            dragOver
              ? 'border-blue-500 bg-blue-50'
              : 'border-border hover:border-blue-400 hover:bg-blue-50/40 bg-white'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            className="hidden"
            onChange={handleFileChange}
          />
          <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center mb-4">
            <FileSpreadsheet size={32} className="text-blue-600" />
          </div>
          <p className="text-base font-semibold text-foreground mb-1">
            {dragOver ? 'Drop your file here' : 'Drag & drop your CSV or Excel file'}
          </p>
          <p className="text-sm text-muted-foreground mb-4">or click to browse files</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="bg-muted px-2 py-1 rounded font-mono">.csv</span>
            <span className="bg-muted px-2 py-1 rounded font-mono">.xlsx</span>
            <span className="bg-muted px-2 py-1 rounded font-mono">.xls</span>
          </div>
        </div>
      )}

      {/* Header errors */}
      {headerErrors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-700 mb-1">File format error</p>
            {headerErrors.map((e, i) => (
              <p key={i} className="text-sm text-red-600">
                {e}
              </p>
            ))}
            <button
              onClick={handleReset}
              className="mt-2 text-xs font-semibold text-red-700 underline"
            >
              Try another file
            </button>
          </div>
        </div>
      )}

      {/* Summary cards */}
      {summary && (
        <>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white border border-border rounded-xl p-4 flex items-center gap-4 shadow-card">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <Users size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{summary.total}</p>
                <p className="text-xs text-muted-foreground">Total Rows</p>
              </div>
            </div>
            <div className="bg-white border border-border rounded-xl p-4 flex items-center gap-4 shadow-card">
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                <CheckCircle2 size={20} className="text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-700">{summary.valid}</p>
                <p className="text-xs text-muted-foreground">Valid Records</p>
              </div>
            </div>
            <div className="bg-white border border-border rounded-xl p-4 flex items-center gap-4 shadow-card">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                <AlertTriangle size={20} className="text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">{summary.errors}</p>
                <p className="text-xs text-muted-foreground">Rows with Errors</p>
              </div>
            </div>
          </div>

          {/* Import success banner */}
          {importDone && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center gap-3">
              <CheckCircle2 size={18} className="text-green-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-green-800">
                  {summary.valid} member{summary.valid !== 1 ? 's' : ''} imported successfully
                </p>
                <p className="text-xs text-green-700">
                  {fileName} —{' '}
                  {summary.errors > 0
                    ? `${summary.errors} rows skipped due to errors`
                    : 'All records imported'}
                </p>
              </div>
              <button
                onClick={handleReset}
                className="text-xs font-semibold text-green-700 hover:text-green-900 underline"
              >
                Upload another file
              </button>
            </div>
          )}

          {/* Preview table */}
          <div className="bg-white rounded-xl border border-border shadow-card overflow-hidden mb-6">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between flex-wrap gap-3">
              <div>
                <h3 className="text-base font-semibold text-foreground">Preview: {fileName}</h3>
                <p className="text-xs text-muted-foreground">
                  {displayedMembers.length} rows shown
                </p>
              </div>
              <div className="flex items-center gap-2">
                {(['all', 'valid', 'error'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setFilterMode(mode)}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors capitalize ${
                      filterMode === mode
                        ? 'bg-blue-600 text-white'
                        : 'bg-muted text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {mode === 'all'
                      ? `All (${summary.total})`
                      : mode === 'valid'
                        ? `Valid (${summary.valid})`
                        : `Errors (${summary.errors})`}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full min-w-[900px]">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide w-12">
                      Row
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Name
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      ID Number
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Ministry
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Payroll No.
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Phone
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Email
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {displayedMembers.map((member) => (
                    <React.Fragment key={`row-${member.rowIndex}`}>
                      <tr
                        className={`transition-colors ${member.status === 'error' ? 'bg-red-50/40' : 'hover:bg-blue-50/20'}`}
                      >
                        <td className="px-3 py-3 text-xs font-mono text-muted-foreground">
                          {member.rowIndex}
                        </td>
                        <td className="px-3 py-3">
                          <p className="text-sm font-semibold text-foreground">
                            {member.firstName} {member.lastName}
                          </p>
                        </td>
                        <td className="px-3 py-3 text-sm font-mono text-foreground">
                          {member.idNumber || '—'}
                        </td>
                        <td
                          className="px-3 py-3 text-sm text-foreground truncate max-w-[140px]"
                          title={member.ministry}
                        >
                          {member.ministry ? member.ministry.replace('Ministry of ', '') : '—'}
                        </td>
                        <td className="px-3 py-3 text-sm font-mono text-muted-foreground">
                          {member.payrollNumber || '—'}
                        </td>
                        <td className="px-3 py-3 text-sm text-foreground">{member.phone || '—'}</td>
                        <td className="px-3 py-3 text-sm text-muted-foreground truncate max-w-[160px]">
                          {member.email || '—'}
                        </td>
                        <td className="px-3 py-3">
                          {member.status === 'valid' ? (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                              <CheckCircle2 size={11} /> Valid
                            </span>
                          ) : (
                            <button
                              onClick={() => toggleErrorExpand(member.rowIndex)}
                              className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-100 px-2 py-0.5 rounded-full hover:bg-red-200 transition-colors"
                            >
                              <AlertCircle size={11} />
                              {member.errors.length} error{member.errors.length > 1 ? 's' : ''}
                              {expandedErrors.includes(member.rowIndex) ? (
                                <ChevronUp size={10} />
                              ) : (
                                <ChevronDown size={10} />
                              )}
                            </button>
                          )}
                        </td>
                      </tr>
                      {member.status === 'error' && expandedErrors.includes(member.rowIndex) && (
                        <tr className="bg-red-50">
                          <td colSpan={8} className="px-6 py-2">
                            <ul className="list-disc list-inside space-y-0.5">
                              {member.errors.map((err, ei) => (
                                <li key={ei} className="text-xs text-red-600">
                                  {err}
                                </li>
                              ))}
                            </ul>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Action bar */}
          {!importDone && (
            <div className="flex items-center justify-between bg-white border border-border rounded-xl px-5 py-4 shadow-card">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Upload size={15} />
                <span>
                  Ready to import{' '}
                  <span className="font-semibold text-foreground">{summary.valid}</span> valid
                  record{summary.valid !== 1 ? 's' : ''}
                  {summary.errors > 0 && (
                    <span className="text-amber-600">
                      {' '}
                      ({summary.errors} rows with errors will be skipped)
                    </span>
                  )}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground bg-muted hover:bg-secondary px-4 py-2 rounded-lg transition-colors"
                >
                  <RefreshCw size={14} />
                  Reset
                </button>
                <button
                  onClick={handleImport}
                  disabled={summary.valid === 0}
                  className="flex items-center gap-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed px-5 py-2 rounded-lg transition-colors shadow-sm"
                >
                  <Upload size={14} />
                  Import {summary.valid} Member{summary.valid !== 1 ? 's' : ''}
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Required columns guide */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-5">
        <p className="text-sm font-semibold text-blue-800 mb-3">Required CSV Columns</p>
        <div className="flex flex-wrap gap-2">
          {REQUIRED_COLUMNS.map((col) => (
            <span
              key={col}
              className="text-xs font-mono bg-white border border-blue-200 text-blue-700 px-2.5 py-1 rounded-lg"
            >
              {col}
            </span>
          ))}
        </div>
        <p className="text-xs text-blue-600 mt-3">
          Download the template above to get a pre-formatted file with all required columns.
        </p>
      </div>
    </div>
  );
}
