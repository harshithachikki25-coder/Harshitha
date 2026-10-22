# Campus Event Analytics Dashboard

A comprehensive, interactive web analytics platform designed for college and university event management. Built with **React**, **TypeScript**, **Recharts**, **PapaParse**, and **Tailwind CSS**.

---

## 🚀 Deployment Options

### Option 1: Live Cloud Preview (Instant)
This project is already built and hosted online via Google AI Studio. You can access and share the live URL directly with your project guide, evaluation committee, or classmates:
* **Live App URL:** Accessible via the **Share** button in the top navigation bar.

---

### Option 2: Deploy to Vercel (Recommended for Free Custom Domains)
1. Push this repository to **GitHub**.
2. Visit [Vercel](https://vercel.com) and click **"Add New"** > **"Project"**.
3. Import your GitHub repository.
4. Keep the default settings:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Click **Deploy**. Your app will be live on a `*.vercel.app` URL within 60 seconds.

---

### Option 3: Deploy to GitHub Pages (Free)
1. Install `gh-pages`:
   ```bash
   npm install --save-dev gh-pages
   ```
2. In `package.json`, add:
   ```json
   "scripts": {
     "predeploy": "npm run build",
     "deploy": "gh-pages -d dist"
   }
   ```
3. Run:
   ```bash
   npm run deploy
   ```
4. Enable GitHub Pages in your repository settings under **Settings > Pages** and set source to `gh-pages` branch.

---

### Option 4: Deploy to Netlify (Free Drag-and-Drop or Git)
1. Run local build:
   ```bash
   npm run build
   ```
2. Drag and drop the generated `dist` folder directly onto [Netlify Drop](https://app.netlify.com/drop).
3. Or link your GitHub repository to Netlify with build command `npm run build` and publish directory `dist`.

---

### Option 5: Running Locally (For Lab Evaluation / Viva Presentation)
1. Clone or download the source code:
   ```bash
   cd campus-event-analytics
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the local development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📊 Features & Analytics Modules

1. **Executive Dashboard**: KPI summary cards (Events, Turnout, Rating, Capacity Utilization, Budget, Departments).
2. **Event Analytics**: Top 10 most popular events and scatter plot of Capacity vs. Turnout with a 100% capacity balance reference line.
3. **Department Analytics**: Departmental turnout rankings, budget allocations, and comparative performance scorecards.
4. **Participation & Capacity**: Monthly participation timeline, venue efficiency analysis, and room sizing health tiers.
5. **Student Feedback Analysis**: Rating distribution, average rating by category, and feedback volume analysis.
6. **Dataset Explorer**: Paginated, sortable, and searchable table with schema completeness inspector and CSV export.
7. **Kaggle CSV Ingestion**: Support for custom CSV uploads with automatic header synonym matching, duplicate detection, and missing-value audit reports.
