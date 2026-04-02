"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, Button, DateFormat, Table, Badge, Select } from "@/components/ui";

type EnrollmentRecord = {
  id: string;
  student_name: string;
  class_name: string;
  amount_paid: number;
  access_mode: string;
  start_access_date: string;
  access_end_date: string;
  created_at: string;
};

export default function EarningsPage() {
  const [data, setData] = useState<EnrollmentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const res = await fetch("/api/admin/enrollments");
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("Failed to fetch earnings data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const startYear = 2024;
    const arr = [];
    for (let y = currentYear; y >= startYear; y--) {
      arr.push(y);
    }
    return arr;
  }, []);

  // Filter logic
  const stats = useMemo(() => {
    const filtered = data.filter(enr => {
      const d = new Date(enr.start_access_date);
      return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
    });

    const prevMonth = selectedMonth === 0 ? 11 : selectedMonth - 1;
    const prevYear = selectedMonth === 0 ? selectedYear - 1 : selectedYear;
    
    const previous = data.filter(enr => {
      const d = new Date(enr.start_access_date);
      return d.getMonth() === prevMonth && d.getFullYear() === prevYear;
    });

    const currentIncome = filtered.reduce((acc, curr) => acc + (curr.amount_paid || 0), 0);
    const prevIncome = previous.reduce((acc, curr) => acc + (curr.amount_paid || 0), 0);
    
    const paidStudents = new Set(filtered.filter(e => e.access_mode === 'paid').map(e => e.id)).size;
    
    // Class-wise breakdown
    const classMap: Record<string, { income: number, students: number }> = {};
    filtered.forEach(enr => {
      if (!classMap[enr.class_name]) {
        classMap[enr.class_name] = { income: 0, students: 0 };
      }
      classMap[enr.class_name].income += (enr.amount_paid || 0);
      if (enr.access_mode === 'paid') {
        classMap[enr.class_name].students += 1;
      }
    });

    return {
      filteredRecords: filtered,
      currentIncome,
      prevIncome,
      paidStudents,
      totalEnrollments: filtered.length,
      classBreakdown: Object.entries(classMap).map(([name, stats]) => ({
        name,
        ...stats
      }))
    };
  }, [data, selectedMonth, selectedYear]);

  const handleDownloadReport = () => {
    const headers = ["Student", "Class", "Mode", "Amount (Rs.)", "Start Date", "End Date", "Enrolled At"];
    const rows = stats.filteredRecords.map(r => [
      r.student_name,
      r.class_name,
      r.access_mode,
      r.amount_paid,
      r.start_access_date,
      r.access_end_date,
      r.created_at
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `earnings_report_${months[selectedMonth]}_${selectedYear}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Earnings Dashboard</h1>
          <p className="text-sm text-slate-600 mt-1">Track monthly income and enrollment reporting</p>
        </div>
        <div className="flex items-center gap-3">
          <Select 
            value={selectedMonth.toString()} 
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            options={months.map((m, i) => ({ value: i.toString(), label: m }))}
          />
          <Select 
            value={selectedYear.toString()} 
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            options={years.map(y => ({ value: y.toString(), label: y.toString() }))}
          />
          <Button onClick={handleDownloadReport} variant="outline" size="sm" className="ml-2">
            📊 Download CSV
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-indigo-600 text-white border-0 shadow-lg relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform duration-500">
                <span className="text-6xl">💰</span>
              </div>
              <p className="text-indigo-100 text-sm font-medium uppercase tracking-wider">Current Month Income</p>
              <h2 className="text-4xl font-extrabold mt-2">Rs. {stats.currentIncome.toLocaleString()}</h2>
              <div className="mt-4 flex items-center text-sm">
                <span className={`px-2 py-0.5 rounded-full font-bold ${stats.currentIncome >= stats.prevIncome ? 'bg-white/20' : 'bg-white/10'}`}>
                   {stats.currentIncome >= stats.prevIncome ? '↑' : '↓'} 
                   {stats.prevIncome > 0 ? (((stats.currentIncome - stats.prevIncome) / stats.prevIncome) * 100).toFixed(1) : '100'}%
                </span>
                <span className="ml-2 text-indigo-100">vs prev month</span>
              </div>
            </Card>

            <Card className="bg-white border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <p className="text-slate-500 text-sm font-medium uppercase tracking-wider">Paid Students</p>
                <h2 className="text-3xl font-bold text-slate-900 mt-2">{stats.paidStudents}</h2>
              </div>
              <p className="text-xs text-slate-500 mt-4">Actual paying members this month</p>
            </Card>

            <Card className="bg-white border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <p className="text-slate-500 text-sm font-medium uppercase tracking-wider">Total Enrollments</p>
                <h2 className="text-3xl font-bold text-slate-900 mt-2">{stats.totalEnrollments}</h2>
              </div>
              <p className="text-xs text-slate-500 mt-4">Total class memberships (inc. free/manual)</p>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Class Breakdown */}
            <div className="lg:col-span-1">
              <Card>
                <h2 className="text-lg font-bold text-slate-900 mb-6">Class-wise Income</h2>
                <div className="space-y-6">
                  {stats.classBreakdown.length === 0 ? (
                    <p className="text-center py-8 text-slate-500 italic">No classes found for this month</p>
                  ) : (
                    stats.classBreakdown.map((item, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="font-semibold text-slate-800">{item.name}</p>
                          <p className="text-xs text-slate-500">{item.students} paid students</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-indigo-600">Rs. {item.income.toLocaleString()}</p>
                          <p className="text-[10px] text-slate-400 capitalize">{( (item.income / (stats.currentIncome || 1)) * 100).toFixed(0)}% of total</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </div>

            {/* Detailed Records */}
            <div className="lg:col-span-2">
              <Card>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-slate-900">Detailed Payment Records</h2>
                  <Badge variant="default">{stats.filteredRecords.length} Records</Badge>
                </div>
                <Table
                  columns={[
                    {
                      key: "student",
                      header: "Student",
                      render: (r: EnrollmentRecord) => (
                        <p className="font-medium text-slate-900">{r.student_name}</p>
                      )
                    },
                    {
                      key: "class",
                      header: "Class",
                      render: (r: EnrollmentRecord) => (
                         <span className="text-slate-600 truncate max-w-[150px] inline-block">{r.class_name}</span>
                      )
                    },
                    {
                      key: "amount",
                      header: "Amount",
                      render: (r: EnrollmentRecord) => (
                        <span className="font-bold text-slate-800 whitespace-nowrap">Rs. {r.amount_paid.toLocaleString()}</span>
                      )
                    },
                    {
                      key: "mode",
                      header: "Mode",
                      render: (r: EnrollmentRecord) => (
                        <Badge variant={r.access_mode === 'paid' ? 'success' : 'default'} className="scale-90 transform origin-left">
                          {r.access_mode}
                        </Badge>
                      )
                    },
                    {
                      key: "dates",
                      header: "Start Date",
                      render: (r: EnrollmentRecord) => (
                        <span className="text-xs text-slate-500 whitespace-nowrap">{r.start_access_date}</span>
                      )
                    }
                  ]}
                  data={stats.filteredRecords}
                  emptyMessage="No records found for the selected period"
                  className="rounded-lg border border-slate-100 overflow-hidden"
                />
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
