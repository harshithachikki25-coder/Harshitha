import React from 'react';
import {
  GraduationCap,
  BookOpen,
  Calculator,
  Layers,
  Database,
  Download,
  Lightbulb,
  CheckCircle,
} from 'lucide-react';
import { exportRecordsToCSV } from '../../utils/dataProcessor';
import { DEMO_DATASET } from '../../data/demoData';

export const AboutView: React.FC = () => {
  const handleDownloadSampleTemplate = () => {
    // Generate a clean sample CSV of 25 rows for Kaggle dataset testing
    exportRecordsToCSV(DEMO_DATASET.slice(0, 25), 'kaggle_campus_events_sample.csv');
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Project Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 lg:p-8 border border-slate-800 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
              <GraduationCap className="w-4 h-4" />
              <span>Bachelor of Technology (B.Tech) Major Capstone Project</span>
            </div>
            <h1 className="text-xl lg:text-2xl font-bold text-white tracking-tight">
              Campus Event Analytics & Capacity Optimization Dashboard
            </h1>
            <p className="text-xs lg:text-sm text-slate-300 max-w-2xl leading-relaxed">
              An institutional intelligence web application built to analyze university-wide event turnout, departmental performance, room capacity utilization, financial allocations, and student feedback sentiment.
            </p>
          </div>

          <div className="shrink-0 flex flex-col gap-2.5">
            <button
              onClick={handleDownloadSampleTemplate}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors whitespace-nowrap"
            >
              <Download className="w-4 h-4" />
              <span>Download Kaggle CSV Template</span>
            </button>
            <span className="text-[11px] text-slate-400 text-center font-mono">
              Ready-to-upload .csv schema
            </span>
          </div>
        </div>
      </div>

      {/* Project Objectives & Core Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <BookOpen className="w-4 h-4 text-indigo-600" />
            <h3>Project Objectives</h3>
          </div>
          <ul className="text-xs text-slate-600 space-y-2 leading-relaxed">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Student Turnout Intelligence:</strong> Quantify and benchmark attendance volumes across technical workshops, fests, hackathons, and seminars.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Department Benchmarking:</strong> Evaluate engagement parity between Computer Science, Electronics, Mechanical, Civil, and Management faculties.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Capacity Optimization:</strong> Detect under-attended sessions (&lt;50% capacity) and overbooked venues (&gt;100% capacity) for proactive room re-allocation.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Feedback Quality Loop:</strong> Correlate student rating scores with budget expenditure and category satisfaction scores.</span>
            </li>
          </ul>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <Layers className="w-4 h-4 text-indigo-600" />
            <h3>Technical Architecture</h3>
          </div>
          <div className="space-y-2 text-xs text-slate-600">
            <div className="p-2.5 bg-slate-50 rounded-lg">
              <strong className="text-slate-900">Frontend Engine:</strong> React 19 SPA running with TypeScript strict mode and Tailwind CSS v4 styling.
            </div>
            <div className="p-2.5 bg-slate-50 rounded-lg">
              <strong className="text-slate-900">Data Visualizations:</strong> Recharts vector library providing 10 distinct interactive visual models (Bar, Line, Scatter, Pie/Donut).
            </div>
            <div className="p-2.5 bg-slate-50 rounded-lg">
              <strong className="text-slate-900">CSV Ingestion & Normalization:</strong> PapaParse stream parsing with auto-header heuristics and manual schema re-mapping.
            </div>
          </div>
        </div>
      </div>

      {/* Mathematical Formulas Used in Analytics */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
          <Calculator className="w-4 h-4 text-indigo-600" />
          <h3>Mathematical & Statistical Formulations</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              1. Capacity Utilization (%)
            </span>
            <div className="my-2 p-2 bg-white rounded border border-slate-200 font-mono text-xs text-indigo-700 text-center font-bold">
              U = (Participants / Capacity) × 100
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Measures space efficiency. Values &gt; 100% indicate crowd overflow; values &lt; 50% signal room over-sizing.
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              2. Budget Per Attendee
            </span>
            <div className="my-2 p-2 bg-white rounded border border-slate-200 font-mono text-xs text-indigo-700 text-center font-bold">
              C_head = Event Budget / Participants
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Evaluates financial return-on-investment (ROI) and cost efficacy across events and departments.
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              3. Weighted Satisfaction Mean
            </span>
            <div className="my-2 p-2 bg-white rounded border border-slate-200 font-mono text-xs text-indigo-700 text-center font-bold">
              R_avg = (∑ Rating_i) / N_events
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Aggregated student satisfaction scores filtered against verified non-zero rating submissions.
            </p>
          </div>
        </div>
      </div>

      {/* Dataset Schema Specification */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs space-y-3">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
          <Database className="w-4 h-4 text-indigo-600" />
          <h3>Kaggle CSV Dataset Schema Specifications</h3>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          The dashboard supports arbitrary Kaggle datasets. When uploaded, the application inspects the header names and auto-maps synonyms. The standard fields are:
        </p>

        <div className="border border-slate-200 rounded-lg overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
              <tr>
                <th className="px-3.5 py-2">Column Name</th>
                <th className="px-3.5 py-2">Expected Type</th>
                <th className="px-3.5 py-2">Description</th>
                <th className="px-3.5 py-2">Accepted Synonyms</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="px-3.5 py-2 font-mono font-bold text-slate-800">Event_ID</td>
                <td className="px-3.5 py-2 font-mono text-slate-500">String</td>
                <td className="px-3.5 py-2 text-slate-600">Unique alphanumeric record identifier</td>
                <td className="px-3.5 py-2 font-mono text-[11px] text-slate-500">event_id, id, code</td>
              </tr>
              <tr>
                <td className="px-3.5 py-2 font-mono font-bold text-slate-800">Event_Name</td>
                <td className="px-3.5 py-2 font-mono text-slate-500">String</td>
                <td className="px-3.5 py-2 text-slate-600">Official title of the event / workshop</td>
                <td className="px-3.5 py-2 font-mono text-[11px] text-slate-500">name, title, event_title</td>
              </tr>
              <tr>
                <td className="px-3.5 py-2 font-mono font-bold text-slate-800">Category</td>
                <td className="px-3.5 py-2 font-mono text-slate-500">String</td>
                <td className="px-3.5 py-2 text-slate-600">Event type (Technical, Cultural, Sports, etc.)</td>
                <td className="px-3.5 py-2 font-mono text-[11px] text-slate-500">category, type, genre</td>
              </tr>
              <tr>
                <td className="px-3.5 py-2 font-mono font-bold text-slate-800">Department</td>
                <td className="px-3.5 py-2 font-mono text-slate-500">String</td>
                <td className="px-3.5 py-2 text-slate-600">Hosting academic department / branch</td>
                <td className="px-3.5 py-2 font-mono text-[11px] text-slate-500">dept, department, branch</td>
              </tr>
              <tr>
                <td className="px-3.5 py-2 font-mono font-bold text-slate-800">Participants</td>
                <td className="px-3.5 py-2 font-mono text-slate-500">Integer</td>
                <td className="px-3.5 py-2 text-slate-600">Total verified attendee student turnout</td>
                <td className="px-3.5 py-2 font-mono text-[11px] text-slate-500">attendees, attendance, headcount</td>
              </tr>
              <tr>
                <td className="px-3.5 py-2 font-mono font-bold text-slate-800">Capacity</td>
                <td className="px-3.5 py-2 font-mono text-slate-500">Integer</td>
                <td className="px-3.5 py-2 text-slate-600">Maximum seating capacity of venue</td>
                <td className="px-3.5 py-2 font-mono text-[11px] text-slate-500">capacity, max_capacity, seats</td>
              </tr>
              <tr>
                <td className="px-3.5 py-2 font-mono font-bold text-slate-800">Rating</td>
                <td className="px-3.5 py-2 font-mono text-slate-500">Float (1–5)</td>
                <td className="px-3.5 py-2 text-slate-600">Student feedback satisfaction score</td>
                <td className="px-3.5 py-2 font-mono text-[11px] text-slate-500">rating, score, satisfaction</td>
              </tr>
              <tr>
                <td className="px-3.5 py-2 font-mono font-bold text-slate-800">Budget</td>
                <td className="px-3.5 py-2 font-mono text-slate-500">Numeric</td>
                <td className="px-3.5 py-2 text-slate-600">Total funds allocated in USD or INR</td>
                <td className="px-3.5 py-2 font-mono text-[11px] text-slate-500">budget, cost, expenditure</td>
              </tr>
              <tr>
                <td className="px-3.5 py-2 font-mono font-bold text-slate-800">Feedback_Count</td>
                <td className="px-3.5 py-2 font-mono text-slate-500">Integer</td>
                <td className="px-3.5 py-2 text-slate-600">Total submitted student survey responses</td>
                <td className="px-3.5 py-2 font-mono text-[11px] text-slate-500">feedback, reviews, responses</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* College Recommendations Card */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs space-y-3">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
          <Lightbulb className="w-4 h-4 text-amber-500" />
          <h3>Recommendations for College Administration & Dean of Student Affairs</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-600">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
            <span className="font-bold text-slate-800 block mb-1">1. Venue Re-allocation:</span>
            Shift high-demand technical hackathons and cultural contests to Main Auditorium and Open Air Theatre to eliminate room over-capacity crowding.
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
            <span className="font-bold text-slate-800 block mb-1">2. Department Support:</span>
            Provide additional cross-promotional channels for non-CS departments (Mechanical, Civil) to boost their student attendance numbers.
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
            <span className="font-bold text-slate-800 block mb-1">3. Feedback Loop Incentives:</span>
            Automate digital certificate distribution upon feedback submission to raise response rate from 35% to over 70%.
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
            <span className="font-bold text-slate-800 block mb-1">4. Budget Allocation Formula:</span>
            Tie annual event budget grants directly to historical student turnouts and satisfaction ratings.
          </div>
        </div>
      </div>
    </div>
  );
};
