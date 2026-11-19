"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, Button, Table, Badge, Select } from "@/components/ui";
import { buildEnrollmentEarnings, colomboDateTime, enrollmentEarningsCsv, type EnrollmentRecord } from "@/lib/reports/enrollment-earnings";


export default function EarningsPage() {
  const [data, setData] = useState<EnrollmentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [today] = useState(() => colomboDateTime(new Date().toISOString())!);
  const [selectedMonth, setSelectedMonth] = useState(() => Number(today.slice(5, 7)) - 1);
  const [selectedYear, setSelectedYear] = useState(() => Number(today.slice(0, 4)));

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const res = await fetch("/api/admin/reports/enrollments", { cache: "no-store" });
        if (!res.ok) throw new Error("Could not load a complete enrollment earnings report. Please reload to try again.");
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("Failed to fetch earnings data:", err);
        setError(err instanceof Error ? err.message : "Could not load enrollment earnings.");
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
    const currentYear = Number(today.slice(0, 4));
    const startYear = 2024;
    const arr = [];
    for (let y = currentYear; y >= startYear; y--) {
      arr.push(y);
    }
    return arr;
  }, [today]);

  const stats = useMemo(() => buildEnrollmentEarnings(data, selectedMonth, selectedYear), [data, selectedMonth, selectedYear]);

  const handleDownloadReport = () => {
    const csvContent = enrollmentEarningsCsv(stats.filteredRecords);

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `earnings_report_${months[selectedMonth]}_${selectedYear}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Earnings Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Track monthly income and enrollment reporting</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
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
          <Button onClick={handleDownloadReport} disabled={loading || !!error} variant="outline" size="sm">
            Download CSV
          </Button>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">Reporting uses the enrollment’s latest update in Asia/Colombo. Later edits or revocations can move its amount to a different month. Access dates are unchanged.</p>
      {error ? <p role="alert" className="rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/40 p-4 text-red-700 dark:text-red-400">{error}</p> : loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          {stats.missingDates > 0 && <p role="status" className="rounded-lg border border-amber-200 dark:border-amber-800/60 bg-amber-50 dark:bg-amber-950/40 p-4 text-sm text-amber-900 dark:text-amber-300">{stats.missingDates} enrollment(s) have no valid update timestamp and cannot be assigned to a month. Their amounts remain in the all-time enrollment total.</p>}
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-primary text-primary-foreground border-0 relative overflow-hidden">
              <p className="text-blue-100 text-sm font-medium uppercase tracking-wider">Total Monthly Earnings</p>
              <h2 className="text-4xl font-bold mt-2 tabular-nums">Rs. {stats.currentIncome.toLocaleString()}</h2>
              <div className="mt-4 flex items-center text-sm">
                <span className={`px-2 py-0.5 rounded-full font-bold ${stats.currentIncome >= stats.prevIncome ? 'bg-white/20' : 'bg-white/10'}`}>
                   {stats.currentIncome >= stats.prevIncome ? '↑' : '↓'} 
                   {stats.prevIncome > 0 ? (((stats.currentIncome - stats.prevIncome) / stats.prevIncome) * 100).toFixed(1) : '100'}%
                </span>
                <span className="ml-2 text-blue-100">vs prev month</span>
              </div>
            </Card>

            <Card className="flex flex-col justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium uppercase tracking-wider">Paid Students</p>
                <h2 className="text-3xl font-bold text-foreground mt-2 tabular-nums">{stats.paidStudents}</h2>
              </div>
              <p className="text-xs text-muted-foreground mt-4">Actual paying members this month</p>
            </Card>

            <Card className="flex flex-col justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium uppercase tracking-wider">Total Enrollments</p>
                <h2 className="text-3xl font-bold text-foreground mt-2 tabular-nums">{stats.totalEnrollments}</h2>
              </div>
              <p className="text-xs text-muted-foreground mt-4">Total class memberships (inc. free/manual)</p>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Class Breakdown */}
            <div className="lg:col-span-1">
              <Card>
                <h2 className="text-lg font-bold text-foreground mb-6">Class-wise Income</h2>
                <div className="space-y-6">
                  {stats.classBreakdown.length === 0 ? (
                    <p className="text-center py-8 text-muted-foreground italic">No classes found for this month</p>
                  ) : (
                    stats.classBreakdown.map((item, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="font-semibold text-foreground">{item.name}</p>
                          <p className="text-xs text-muted-foreground">{item.students} paid students</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-link tabular-nums">Rs. {item.income.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground capitalize">{( (item.income / (stats.currentIncome || 1)) * 100).toFixed(0)}% of total</p>
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
                  <h2 className="text-lg font-bold text-foreground">Enrollment records</h2>
                  <Badge variant="default">{stats.filteredRecords.length} Records</Badge>
                </div>
                <Table
                  columns={[
                    {
                      key: "student",
                      header: "Student",
                      render: (r: EnrollmentRecord) => (
                        <p className="font-medium text-foreground">{r.student_name}</p>
                      )
                    },
                    {
                      key: "class",
                      header: "Class",
                      render: (r: EnrollmentRecord) => (
                         <span className="text-muted-foreground truncate max-w-[150px] inline-block">{r.class_name}</span>
                      )
                    },
                    {
                      key: "amount",
                      header: "Amount",
                      render: (r: EnrollmentRecord) => (
                        <span className="font-bold text-foreground whitespace-nowrap tabular-nums">Rs. {(Number(r.amount_paid) || 0).toLocaleString()}</span>
                      )
                    },
                    {
                      key: "mode",
                      header: "Mode",
                      render: (r: EnrollmentRecord) => (
                        <Badge variant={r.access_mode === 'paid' ? 'success' : 'default'}>
                          {r.access_mode}
                        </Badge>
                      )
                    },
                    {
                      key: "dates",
                      header: "Enrollment updated (Sri Lanka)",
                      render: (r: EnrollmentRecord) => (
                        <span className="text-xs text-muted-foreground whitespace-nowrap">{colomboDateTime(r.updated_at) ?? "Unavailable"}</span>
                      )
                    }
                  ]}
                  data={stats.filteredRecords}
                  emptyMessage="No records found for the selected period"
                  className="rounded-lg border border-border overflow-hidden"
                />
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
