"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, Button, Badge, DateFormat, Select, Table, SearchBar } from "@/components/ui";

export default function MonthlyReportPage() {
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [searchQuery, setSearchQuery] = useState("");

  const fetchReport = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/admin/reports/monthly?month=${month}&year=${year}`);
      if (!res.ok) throw new Error("Failed to fetch report");
      const data = await res.json();
      setReportData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const exportCSV = () => {
    if (!reportData) return;

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Class,Student Name,Phone,Access Mode,Payment Date,Expiry Date,Amount\n";

    reportData.classGroups.forEach((group: any) => {
      group.rows.forEach((row: any) => {
        csvContent += `"${group.name}","${row.student_name}","${row.phone || ""}","${row.mode}","${row.payment_date}","${row.expiry_date}","${row.amount}"\n`;
      });
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `monthly_report_${year}_${month}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const months = [
    { value: "1", label: "January" },
    { value: "2", label: "February" },
    { value: "3", label: "March" },
    { value: "4", label: "April" },
    { value: "5", label: "May" },
    { value: "6", label: "June" },
    { value: "7", label: "July" },
    { value: "8", label: "August" },
    { value: "9", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  const years = Array.from({ length: 5 }, (_, i) => ({
    value: (new Date().getFullYear() - 2 + i).toString(),
    label: (new Date().getFullYear() - 2 + i).toString(),
  }));

  return (
    <div className="space-y-8 pb-12">
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Monthly Financial Report</h1>
          <p className="text-slate-500 mt-1">Detailed breakdown of payments and active free cards</p>
        </div>
        
        <div className="flex flex-wrap items-end gap-3">
          <div className="w-40">
            <Select
              label="Month"
              value={month.toString()}
              onChange={(e) => setMonth(parseInt(e.target.value))}
              options={months}
            />
          </div>
          <div className="w-32">
            <Select
              label="Year"
              value={year.toString()}
              onChange={(e) => setYear(parseInt(e.target.value))}
              options={years}
            />
          </div>
          <Button onClick={exportCSV} variant="outline" className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export CSV
          </Button>
          <Button onClick={() => window.print()} variant="outline" className="hidden md:flex flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
            Print
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-indigo-600"></div>
        </div>
      ) : error ? (
        <Card className="bg-red-50 border-red-200 p-8 text-center">
          <p className="text-red-700 font-medium">{error}</p>
          <Button onClick={fetchReport} className="mt-4" variant="outline">Try Again</Button>
        </Card>
      ) : reportData ? (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 p-6 rounded-2xl text-white shadow-lg shadow-indigo-200">
              <p className="text-indigo-100 text-sm font-medium">Monthly Income</p>
              <h2 className="text-4xl font-black mt-1">Rs. {reportData.summary.totalMonthlyIncome.toLocaleString()}</h2>
              <div className="mt-4 flex items-center gap-2 text-indigo-100 text-xs">
                <span className="bg-indigo-500/30 px-2 py-0.5 rounded-full">Primary Revenue</span>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <p className="text-slate-500 text-sm font-medium">Paid Students</p>
              <h2 className="text-4xl font-black text-slate-900 mt-1">{reportData.summary.totalPaidStudents}</h2>
              <p className="text-xs text-slate-400 mt-4">Approved full payments</p>
            </div>
            
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <p className="text-slate-500 text-sm font-medium">Free Card Students</p>
              <h2 className="text-4xl font-black text-slate-900 mt-1">{reportData.summary.totalFreeCardStudents}</h2>
              <p className="text-xs text-slate-400 mt-4">Active non-paying students</p>
            </div>
          </div>

          <div className="mb-4">
             <SearchBar placeholder="Search student name in this report..." value={searchQuery} onChange={setSearchQuery} />
          </div>

          {/* Class-wise Groups */}
          {reportData.classGroups.length === 0 ? (
            <Card className="p-12 text-center text-slate-500">
               No records found for the selected period.
            </Card>
          ) : (
            <div className="space-y-10">
              {reportData.classGroups.map((group: any) => {
                const filteredRows = group.rows.filter((r: any) => 
                  r.student_name.toLowerCase().includes(searchQuery.toLowerCase())
                );
                
                if (searchQuery && filteredRows.length === 0) return null;

                return (
                  <div key={group.name} className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                       <h3 className="text-xl font-bold text-slate-800">{group.name}</h3>
                       <div className="flex gap-4 text-sm">
                          <span className="text-slate-500">Paid: <b className="text-slate-900">{group.paidCount}</b></span>
                          <span className="text-slate-500">Free: <b className="text-slate-900">{group.freeCardCount}</b></span>
                          <span className="text-slate-500">Income: <b className="text-indigo-600 font-bold">Rs. {group.totalIncome.toLocaleString()}</b></span>
                       </div>
                    </div>
                    
                    <Card className="overflow-hidden border-slate-200">
                      <Table
                        columns={[
                          {
                            key: "student",
                            header: "Student",
                            render: (row: any) => (
                              <div>
                                <p className="font-semibold text-slate-900">{row.student_name}</p>
                                <p className="text-xs text-slate-500">{row.phone || "No phone"}</p>
                              </div>
                            ),
                          },
                          {
                            key: "mode",
                            header: "Type",
                            render: (row: any) => (
                              <Badge variant={row.mode === "free_card" ? "success" : row.mode === "manual" ? "warning" : "default"}>
                                {row.mode}
                              </Badge>
                            ),
                          },
                          {
                            key: "payment_date",
                            header: "Date",
                            render: (row: any) => <DateFormat date={row.payment_date} format="short" />,
                          },
                          {
                            key: "expiry",
                            header: "Expiry",
                            render: (row: any) => <DateFormat date={row.expiry_date} format="short" />,
                          },
                          {
                            key: "amount",
                            header: "Amount",
                            className: "text-right font-medium",
                            render: (row: any) => row.mode === "paid" ? `Rs. ${row.amount.toLocaleString()}` : <span className="text-slate-400">-</span>,
                          },
                        ]}

                        data={filteredRows}
                        className="bg-white"
                      />
                    </Card>
                  </div>
                );
              })}
            </div>
          )}
        </>
      ) : null}
      
      {/* Print styles */}
      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          .space-y-8, .space-y-8 * { visibility: visible; }
          .space-y-8 { position: absolute; left: 0; top: 0; width: 100%; }
          button, .SearchBar { display: none !important; }
        }
      `}</style>
    </div>
  );
}
