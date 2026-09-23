# EcoRecover AI
### AI-Assisted E-Waste Material Passport, Recovery Advisor & Disassembly Simulation System

[![Python 3.11](https://img.shields.io/badge/python-3.11-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg)](https://fastapi.tiangolo.com/)
[![React 19](https://img.shields.io/badge/React-19+-61DAFB.svg)](https://react.dev/)
[![SimPy](https://img.shields.io/badge/SimPy-Discrete--Event-orange.svg)](https://simpy.readthedocs.io/)
[![Monte Carlo](https://img.shields.io/badge/Monte_Carlo-1000_Runs-success.svg)](https://numpy.org/)

EcoRecover AI is a full-stack decision-support and circular engineering platform designed for e-waste recyclers, electronics refurbishers, and sustainability researchers. It merges **Computer Vision**, **deterministic safety rule engines**, **discrete-event disassembly simulation (SimPy)**, and **Monte Carlo stochastic uncertainty modeling (NumPy)** to formulate optimal recovery strategies for discarded electronic items.

---

## 1. System Architecture

```text
                                  USER INTAKE
                         (Image Upload + Device State)
                                       │
                                       ▼
                       ┌───────────────────────────────┐
                       │   FastAPI Modular Engine      │
                       └───────────────┬───────────────┘
                                       │
            ┌──────────────────────────┼──────────────────────────┐
            ▼                          ▼                          ▼
┌───────────────────────┐  ┌───────────────────────┐  ┌───────────────────────┐
│ AI Vision Inspection  │  │ Condition Evaluator   │  │  Knowledge Graph      │
│ Aspect Ratio & Wear   │  │ Multi-Variable Weight │  │ Taxonomy & Materials  │
└───────────┬───────────┘  └───────────┬───────────┘  └───────────┬───────────┘
            │                          │                          │
            └──────────────────────────┼──────────────────────────┘
                                       ▼
                       ┌───────────────────────────────┐
                       │   Component & Material Audit  │
                       │   Visible vs Expected Specs   │
                       └───────────────┬───────────────┘
                                       │
            ┌──────────────────────────┴──────────────────────────┐
            ▼                                                     ▼
┌───────────────────────┐                             ┌───────────────────────┐
│ Digital Material      │                             │ Recovery & Safety     │
│ Passport (DPP)        │                             │ Advisor Engine        │
│ • Circularity Index   │                             │ • DOs & DON'Ts        │
│ • Mass Allocation     │                             │ • Lithium Ban on      │
│ • CO2 & Tree Offsets  │                             │   Manual Teardowns    │
└───────────┬───────────┘                             └───────────┬───────────┘
            │                                                     │
            └──────────────────────────┬──────────────────────────┘
                                       ▼
                       ┌───────────────────────────────┐
                       │   Simulation & Optimization   │
                       └───────────────┬───────────────┘
                                       │
            ┌──────────────────────────┼──────────────────────────┐
            ▼                          ▼                          ▼
┌───────────────────────┐  ┌───────────────────────┐  ┌───────────────────────┐
│ Workstation SimPy     │  │ Monte Carlo Simulator │  │ Multi-Objective Scorer│
│ Precedence Timeline   │  │ 1,000 Stochastic Runs │  │ Direct vs Selective vs│
│ Time & Tool Constraints│  │ P5, P50, P95 Bounds   │  │ Full Harvesting       │
└───────────────────────┘  └───────────────────────┘  └───────────────────────┘
                                       │
                                       ▼
                       ┌───────────────────────────────┐
                       │ Modern React + Vite Dashboard │
                       └───────────────────────────────┘
```

---

## 2. Key Academic & Technical Capabilities

### 1. Computer Vision & Heuristic Protection
- **No Hallucinated Components**: Distinguishes **visually verified** exterior subassemblies (Chassis, Display, Keyboard) from **expected internal parts** (Battery, Motherboard, NVMe SSD, SO-DIMM RAM) based on verified taxonomy.
- **Surface Wear Extraction**: Analyzes spatial gradient roughness and intensity variance to quantify cosmetic degradation.

### 2. Multi-Variable Condition Scoring
Calculates composite component condition using weighted multi-variable decay:
$$\text{Condition} = 0.25 \cdot \text{Visual} + 0.35 \cdot \text{Ops} + 0.25 \cdot \text{AgeDecay} + 0.15 \cdot \text{FaultIntegrity}$$
Where age decay models electronic component reliability with half-life depreciation:
$$\text{AgeRetention}(t) = \frac{1}{1 + 0.12 \cdot t}$$

### 3. Digital Material Passport (DPP)
Compliant with European Ecodesign for Sustainable Products Regulation (ESPR) and WEEE Directive 2012/19/EU:
- **Mass Allocations**: Total device mass, recoverable raw materials, reusable modules, and residual waste.
- **Circularity Index**: Percent of device mass diverted from landfill.
- **Life Cycle Assessment (LCA) Offsets**: Estimated avoided $\text{CO}_2\text{-eq}$ and equivalent trees planted.

### 4. Deterministic Safety & Recovery Advisor
- **Strict Hazard Invariant**: Lithium-ion batteries **strictly prohibit manual cell-level teardowns** to prevent thermal runaway; requires transport in fire-retardant vermiculite drums to certified hydrometallurgical recycling facilities.
- **Data Eradication**: Flags storage media for mandatory NIST SP 800-88 cryptographic wipe or 2mm cross-cut shredding.

### 5. SimPy Discrete-Event Disassembly Modeling
- Simulates single-device workstation operations using precedence-constrained dismantling sequences:
  $$\text{Chassis} \to \text{Battery Isolation} \to \text{SSD/RAM} \to \text{Cooling Heatsinks} \to \text{Motherboard} \to \text{Display}$$
- Tracks tool requirements, step durations, and mechanical damage risks.

### 6. NumPy Monte Carlo Uncertainty Simulation
- Executes configurable ($100$ to $2,500$) stochastic realizations per batch.
- Models Bernoulli damage occurrence:
  $$D_i \sim \text{Bernoulli}(p_{\text{damage}})$$
- Produces 95% confidence intervals (P5 worst-case, P50 median, P95 best-case) and density distribution histograms.

### 7. Multi-Objective Strategy Optimizer
Compares three canonical strategies:
1. **Direct Shredding & Material Recovery** (Low time, no reuse, moderate material yield).
2. **Full Manual Component Harvesting** (High labor time, maximum reuse potential, higher damage risk).
3. **Optimized Selective Recovery** (Selects components where expected net value exceeds labor cost and risk threshold).

Scores strategies using a multi-attribute utility function:
$$\text{Utility} = 0.35 \hat{V} + 0.20 \hat{M} + 0.20 \hat{R} - 0.10 \hat{T} - 0.05 \hat{D} - 0.10 \hat{C}$$

---

## 3. Technology Stack

- **Backend**: Python 3.11, FastAPI, SQLAlchemy ORM, Pydantic v2, SimPy 4, NumPy, SciPy, Pillow, pytest.
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React, Recharts.
- **Database**: SQLite (default zero-config out-of-the-box) or PostgreSQL via Docker.

---

## 4. Quickstart & Local Setup

### Prerequisites
- Python 3.11+
- Node.js 18+ and npm

### Step 1: Clone or Navigate to Directory
```powershell
cd c:\ME\SEM-7\WASTE
```

---

### Step 2: Backend Setup

1. **Navigate to the backend folder**:
   ```powershell
   cd backend
   ```

2. **Create and activate the virtual environment**:
   ```powershell
   python -m venv venv
   .\venv\Scripts\Activate.ps1
   ```

3. **Install dependencies**:
   ```powershell
   pip install -r requirements.txt
   ```

4. **Seed the database** (loads materials and laptop taxonomy):
   ```powershell
   python seed.py
   ```

5. **Run the automated test suite**:
   ```powershell
   python -m pytest tests/ -v
   ```
   *(All 10 unit and API tests will pass).*

6. **Start the FastAPI backend server**:
   ```powershell
   python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
   ```
   - Swagger Interactive API Docs: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
   - Alternative ReDoc: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

---

### Step 3: Frontend Setup

1. **Open a new terminal and navigate to the frontend folder**:
   ```powershell
   cd c:\ME\SEM-7\WASTE\frontend
   ```

2. **Install frontend dependencies**:
   ```powershell
   npm install
   ```

3. **Verify build compilation**:
   ```powershell
   npm run build
   ```

4. **Start the Vite development server**:
   ```powershell
   npm run dev
   ```
   - Open your browser at: [http://localhost:5173](http://localhost:5173)

---

### Step 4: Optional PostgreSQL Deployment (Docker)

If you prefer running a dedicated PostgreSQL database instead of the default SQLite:
```powershell
# From root directory:
docker compose up -d

# Set in backend/.env:
DATABASE_URL=postgresql://postgres:postgrespassword@localhost:5432/ecorecover

# Re-run seed script:
cd backend
python seed.py
```

---

## 5. API Endpoints Reference

| HTTP Method | Path | Description |
| :--- | :--- | :--- |
| `POST` | `/api/analyze` | Intake device image, user condition, and synthesize component inventory |
| `GET` | `/api/passport/{analysis_id}` | Retrieve verifiable Digital Material Passport |
| `GET` | `/api/recommendations/{analysis_id}`| Retrieve safety guidelines, DOs/DON'Ts, and hazardous warnings |
| `POST` | `/api/simulation/run` | Execute Monte Carlo simulation for selected strategy |
| `POST` | `/api/simulation/compare` | Evaluate all 3 strategies with multi-objective optimization |
| `GET` | `/api/simulation/process-timeline/{analysis_id}` | SimPy discrete-event workstation dismantling sequence |
| `GET` | `/api/health` | Backend healthcheck |

---

## 6. Project Directory Layout

```text
WASTE/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── endpoints/
│   │   │   │   ├── analyze.py
│   │   │   │   ├── passport.py
│   │   │   │   ├── recommendations.py
│   │   │   │   └── simulation.py
│   │   │   └── router.py
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   └── database.py
│   │   ├── data/
│   │   │   ├── laptop_taxonomy.json
│   │   │   ├── materials.json
│   │   │   └── safety_rules.json
│   │   ├── models/
│   │   │   ├── analysis.py
│   │   │   ├── component.py
│   │   │   ├── material.py
│   │   │   ├── product.py
│   │   │   └── simulation.py
│   │   ├── schemas/
│   │   │   ├── analysis.py
│   │   │   ├── passport.py
│   │   │   ├── recommendation.py
│   │   │   └── simulation.py
│   │   ├── services/
│   │   │   ├── advisor_engine.py
│   │   │   ├── ai_vision.py
│   │   │   ├── condition_engine.py
│   │   │   ├── disassembly_sim.py
│   │   │   ├── material_passport.py
│   │   │   ├── monte_carlo.py
│   │   │   └── optimizer.py
│   │   └── main.py
│   ├── tests/
│   │   ├── test_api.py
│   │   ├── test_condition.py
│   │   └── test_simulation.py
│   ├── requirements.txt
│   └── seed.py
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── advisor/SafetyAdvisorView.tsx
│   │   │   ├── layout/Navbar.tsx
│   │   │   ├── passport/MaterialPassportCard.tsx
│   │   │   ├── simulation/SimulationStudio.tsx
│   │   │   └── upload/DeviceIntakeForm.tsx
│   │   ├── services/api.ts
│   │   ├── types/index.ts
│   │   ├── App.tsx
│   │   ├── index.css
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
├── docker-compose.yml
└── README.md
```

---

## 7. Compliance and Academic Disclaimer

> **Academic Notice**: AI-generated component identifications and material compositions are research-grade estimates and must not be interpreted as certified industrial assaying or certified hazardous material handling certifications. Always adhere to local electrical safety and WEEE disposal legislation.
