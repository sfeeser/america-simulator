let debtChart;
let safetyNetChart;

function calculateOutcomes() {
  // Base values (2025 estimates)
  let debt = 26e12; // $26T
  let revenue = 4.9e12; // $4.9T
  let spending = 6.1e12; // $6.1T
  let mortgageSavings = 0;
  let jobGrowth = 0;
  let tariffRevenue = 0;
  let goldCardRevenue = 0;
  let interestRate = 0.04; // Default 4% on debt
  const safetyNetCost = 2.4e12; // SS ($1.4T) + Medicare ($1T) baseline
  const militaryBaseline = 0.9e12; // $0.9T military spending
  const medicaidBaseline = 0.6e12; // $0.6T Medicaid baseline
  const veteransBaseline = 0.3e12; // $0.3T Veterans' benefits baseline

  // Options
  const uscbRefinance = document.getElementById('uscbRefinance').checked;
  const matchingTariffs = document.getElementById('matchingTariffs').checked;
  const slimGovCheckbox = document.getElementById('slimGov');
  const keepSafetyNetsCheckbox = document.getElementById('keepSafetyNets');
  const keepMedicaidCheckbox = document.getElementById('keepMedicaid');
  const keepVeteransCheckbox = document.getElementById('keepVeterans');
  const noCuts = document.getElementById('noCuts').checked;
  const boomPhase = document.getElementById('boomPhase').checked;
  const goldCardAmount = parseInt(document.querySelector('input[name="goldCardAmount"]:checked').value) || 0;
  const militaryReductionPercent = parseInt(document.querySelector('input[name="militaryReduction"]:checked').value) || 0;
  let taxRate = document.getElementById('taxRate').value / 100;
  const loanBalance = parseInt(document.getElementById('mortgageAmount').value) || 300000;
  let currentRate = parseFloat(document.getElementById('mortgageInterest').value) / 100 || 0.05;

  // Handle "No Cuts" override
  const militaryInputs = document.querySelectorAll('input[name="militaryReduction"]');
  if (noCuts) {
    slimGovCheckbox.checked = false;
    slimGovCheckbox.disabled = true;
    document.getElementById('slimGovLabel').style.color = 'gray';
    keepSafetyNetsCheckbox.checked = false;
    keepSafetyNetsCheckbox.disabled = true;
    document.getElementById('safetyNetsLabel').style.color = 'gray';
    keepMedicaidCheckbox.checked = false;
    keepMedicaidCheckbox.disabled = true;
    document.getElementById('medicaidLabel').style.color = 'gray';
    keepVeteransCheckbox.checked = false;
    keepVeteransCheckbox.disabled = true;
    document.getElementById('veteransLabel').style.color = 'gray';
    militaryInputs.forEach(input => {
      input.disabled = true;
      if (input.value === "0") input.checked = true; // Reset to "None"
    });
    document.getElementById('militaryLabel').style.color = 'gray';
  } else {
    slimGovCheckbox.disabled = false;
    document.getElementById('slimGovLabel').style.color = '';
    keepSafetyNetsCheckbox.disabled = false;
    document.getElementById('safetyNetsLabel').style.color = '';
    keepMedicaidCheckbox.disabled = false;
    document.getElementById('medicaidLabel').style.color = '';
    keepVeteransCheckbox.disabled = false;
    document.getElementById('veteransLabel').style.color = '';
    militaryInputs.forEach(input => input.disabled = false);
    document.getElementById('militaryLabel').style.color = '';
  }
  const slimGov = slimGovCheckbox.checked;
  const keepSafetyNets = keepSafetyNetsCheckbox.checked;
  const keepMedicaid = keepMedicaidCheckbox.checked;
  const keepVeterans = keepVeteransCheckbox.checked;

  // Adjust based on choices
  let mortgageRate = currentRate;
  if (uscbRefinance) {
    mortgageRate = 0.02;
    mortgageSavings = (currentRate - 0.02) * loanBalance / 12;
    tariffRevenue = 120e9; // $120B from USCB
  }
  document.getElementById('uscbRevenue').textContent = `${(uscbRefinance ? 120 : 0)} $B`;

  if (matchingTariffs) {
    tariffRevenue += 170e9; // $170B from tariffs
  }
  document.getElementById('tariffRevenue').textContent = `${(matchingTariffs ? 170 : 0)} $B`;

  let slimGovImpact = 0;
  if (slimGov && !noCuts) {
    slimGovImpact = keepSafetyNets ? (6.1e12 - 3.4e12) : (6.1e12 - 0.96e12);
    spending = keepSafetyNets ? 3.4e12 : 0.96e12;
    jobGrowth -= keepSafetyNets ? 2 : 4;
  }
  document.getElementById('slimGovRevenue').textContent = `${(slimGov && !noCuts ? (keepSafetyNets ? 2700 : 5140) : 0)} $B`;

  document.getElementById('safetyNetRevenue').textContent = `${(slimGov && !keepSafetyNets && !noCuts ? -2440 : 0)} $B`;

  let militaryImpact = 0;
  if (!noCuts) {
    militaryImpact = militaryBaseline * (militaryReductionPercent / 100);
    spending -= militaryImpact;
  }
  document.getElementById('militaryRevenue').textContent = `${(noCuts ? 0 : militaryImpact / 1e9).toFixed(0)} $B`;

  let medicaidImpact = 0;
  if (keepMedicaid && !noCuts) {
    medicaidImpact = medicaidBaseline; // $0.6T if kept
  } else if (!noCuts) {
    spending -= medicaidBaseline; // Cut $0.6T if not kept
  }
  document.getElementById('medicaidRevenue').textContent = `${(keepMedicaid && !noCuts ? 0 : noCuts ? 0 : -600)} $B`;

  let veteransImpact = 0;
  if (keepVeterans && !noCuts) {
    veteransImpact = veteransBaseline; // $0.3T if kept
  } else if (!noCuts) {
    spending -= veteransBaseline; // Cut $0.3T if not kept
  }
  document.getElementById('veteransRevenue').textContent = `${(keepVeterans && !noCuts ? 0 : noCuts ? 0 : -300)} $B`;

  if (noCuts) {
    spending = 6.1e12;
    jobGrowth += 1;
    interestRate = 0.06;
    debt += (spending - revenue) * 2;
  }
  document.getElementById('noCutsRevenue').textContent = `${(noCuts ? -2700 : 0)} $B`;

  const taxRevenue = revenue * taxRate;
  revenue += taxRevenue;
  document.getElementById('taxRevenue').textContent = `${(taxRevenue / 1e9).toFixed(0)} $B`;

  if (boomPhase && uscbRefinance && matchingTariffs) {
    jobGrowth += 2;
  }
  document.getElementById('boomRevenue').textContent = "0 $B";

  goldCardRevenue = goldCardAmount * 5e6;
  revenue += goldCardRevenue;
  document.getElementById('goldCardRevenue').textContent = `${(goldCardRevenue / 1e9).toFixed(0)} $B`;

  // Job Market Outlook
  let jobOutlook = '';
  const jobChange = Math.abs(jobGrowth) * 1.5; // 1% ≈ 1.5M jobs
  if (jobGrowth < -1) {
    jobOutlook = `Weak (-${jobChange.toFixed(1)} million jobs)`;
  } else if (jobGrowth <= 1) {
    jobOutlook = `Stable (±0 million)`;
  } else {
    jobOutlook = `Strong (+${jobChange.toFixed(1)} million jobs)`;
  }
  console.log(`jobGrowth: ${jobGrowth}, jobOutlook: ${jobOutlook}`);

  // Adjust tax rate based on surplus
  const initialInterestCost = debt * interestRate;
  let surplus = revenue - spending - (noCuts ? initialInterestCost : 0);
  let adjustedTaxRate = taxRate;
  if (surplus > 0) {
    adjustedTaxRate = Math.max(-0.1, taxRate - (surplus / 1e12) * 0.02);
    revenue = 4.9e12 + tariffRevenue + goldCardRevenue + (4.9e12 * adjustedTaxRate);
    surplus = revenue - spending - (noCuts ? initialInterestCost : 0);
  }

  // Estimate inflation/deflation with interest feedback
  let inflationRate = 0;
  const deficit = -surplus / 1e12;
  if (deficit > 0) {
    inflationRate = 0.8 * Math.pow(deficit, 2) + 1.2 * deficit;
    inflationRate = Math.min(20, inflationRate);
  } else if (deficit < 0) {
    const surplusInT = surplus / 1e12;
    const interestSavingsFactor = 0.5 * (surplus / debt);
    inflationRate = -0.5 * surplusInT * (1 + interestSavingsFactor);
    inflationRate = Math.max(-5, inflationRate);
  } else {
    inflationRate = -0.1;
  }

  const yearsToPayoff = surplus > 0 ? Math.ceil(debt / surplus) : Infinity;
  const mortgagePayment = (loanBalance * mortgageRate / 12).toFixed(0);
  const impactScore = Math.min(100, Math.max(0, 50 + (surplus > 0 ? 20 : -20) + (mortgageSavings > 0 ? 20 : 0) + jobGrowth * 5 - (noCuts && surplus < 0 ? 30 : 0)));

  // Debt chart (15 years) with dynamic interest
  const debtData = [];
  let remainingDebt = debt;
  let yearlySurplus = surplus;
  for (let year = 0; year <= 15; year++) {
    debtData.push(remainingDebt / 1e12);
    const yearlyInterest = remainingDebt * interestRate;
    yearlySurplus = revenue - spending - (noCuts ? yearlyInterest : 0);
    remainingDebt -= yearlySurplus;
    if (noCuts && yearlySurplus < 0) remainingDebt += yearlyInterest;
  }

  // Safety Net chart (15 years)
  const safetyNetData = [];
  const goalData = Array(16).fill(2.4);
  let currentDebt = debt;
  let yearsUntilUnfunded = 0;
  let cumulativeBoost = 0;
  for (let year = 0; year <= 15; year++) {
    const yearlyInterest = currentDebt * interestRate;
    const fundingLeft = revenue - spending - yearlyInterest;
    cumulativeBoost += surplus > 0 && keepSafetyNets ? surplus * 0.02 : 0;
    const safetyNetFunding = safetyNetCost + cumulativeBoost;
    safetyNetData.push(fundingLeft > safetyNetFunding ? safetyNetFunding / 1e12 : fundingLeft / 1e12);
    if (fundingLeft < safetyNetCost && yearsUntilUnfunded === 0) yearsUntilUnfunded = year;
    currentDebt -= surplus;
    if (noCuts && surplus < 0) currentDebt += yearlyInterest;
  }

  // Update UI
  document.getElementById('mortgage').textContent = `$${mortgagePayment}`;
  document.getElementById('jobOutlook').textContent = jobOutlook;
  document.getElementById('jobs').textContent = `${jobGrowth.toFixed(1)}%`;
  document.getElementById('boomNote').textContent = boomPhase && uscbRefinance && matchingTariffs ? '(+2% kicks in after 2 years)' : boomPhase ? '(Needs USCB & Tariffs for boom)' : '';
  
  const safetyNetsSpan = document.getElementById('safetyNets');
  const otherServicesSpan = document.getElementById('otherServices');
  const fundingStart = safetyNetData[0];
  const fundingSlope = safetyNetData[1] - safetyNetData[0];
  if (fundingStart < 0 || (noCuts && surplus < 0)) {
    safetyNetsSpan.textContent = 'Failing (Debt Crush)';
    safetyNetsSpan.className = 'failing';
    otherServicesSpan.textContent = 'Failing (Debt Crush)';
    otherServicesSpan.className = 'failing';
  } else if (fundingSlope < 0 && fundingStart > 0) {
    safetyNetsSpan.textContent = 'Strained';
    safetyNetsSpan.className = '';
    otherServicesSpan.textContent = 'Strained';
    otherServicesSpan.className = '';
  } else if (fundingSlope > 0) {
    safetyNetsSpan.textContent = 'Thriving';
    safetyNetsSpan.className = '';
    otherServicesSpan.textContent = 'Thriving';
    otherServicesSpan.className = '';
  } else {
    safetyNetsSpan.textContent = 'Stable';
    safetyNetsSpan.className = '';
    otherServicesSpan.textContent = 'Stable';
    otherServicesSpan.className = '';
  }
  
  document.getElementById('adjustedTax').textContent = `${(adjustedTaxRate * 100).toFixed(1)}%`;
  document.getElementById('debtYears').textContent = yearsToPayoff === Infinity ? 'Never (Debt Explodes)' : `${yearsToPayoff} years`;
  document.getElementById('impactScore').textContent = `${impactScore}/100`;
  document.getElementById('inflation').textContent = `${inflationRate.toFixed(1)}%`;

  // Draw charts with "FAIL" overlay
  updateDebtChart(debtData);
  updateSafetyNetChart(safetyNetData, goalData);
}

// Custom plugin for "FAIL" overlay
const failPlugin = {
  id: 'failOverlay',
  afterDraw: (chart, args, options) => {
    const { ctx, chartArea } = chart;
    ctx.save();
    ctx.font = '60px Arial';
    ctx.fillStyle = 'rgba(255, 0, 0, 0.3)'; // Red, translucent
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const centerX = (chartArea.left + chartArea.right) / 2;
    const centerY = (chartArea.top + chartArea.bottom) / 2;

    if (chart.canvas.id === 'debtChart' && options.debtRising) {
      ctx.fillText('FAIL', centerX, centerY);
    } else if (chart.canvas.id === 'safetyNetChart' && options.ssFalling) {
      ctx.fillText('FAIL', centerX, centerY);
    }
    ctx.restore();
  }
};

function updateDebtChart(debtData) {
  if (debtChart) debtChart.destroy();
  const debtRising = debtData[15] > debtData[0]; // Deficit rising if Year 15 > Year 0
  debtChart = new Chart(document.getElementById('debtChart').getContext('2d'), {
    type: 'line',
    data: {
      labels: Array(debtData.length).fill().map((_, i) => `Year ${i}`),
      datasets: [{
        label: 'National Debt ($T)',
        data: debtData,
        borderColor: '#007BFF',
        fill: false
      }]
    },
    options: {
      scales: {
        y: {
          min: -20,
          max: 100,
          title: { display: true, text: 'Debt ($T)' },
          grid: {
            lineWidth: (context) => context.tick.value === 0 ? 2 : 1,
            color: (context) => context.tick.value === 0 ? '#000000' : '#e0e0e0'
          }
        },
        x: { title: { display: true, text: 'Years' } }
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: function(context) {
              const value = context.parsed.y;
              return value < 0 ? `Surplus: ${Math.abs(value).toFixed(1)} $T` : `Debt: ${value.toFixed(1)} $T`;
            },
            labelColor: function(context) {
              const value = context.parsed.y;
              return {
                borderColor: value < 0 ? '#00FF00' : '#007BFF',
                backgroundColor: value < 0 ? '#00FF00' : '#007BFF'
              };
            }
          }
        },
        failOverlay: { debtRising }
      }
    },
    plugins: [failPlugin]
  });
}

function updateSafetyNetChart(safetyNetData, goalData) {
  if (safetyNetChart) safetyNetChart.destroy();
  const fundingSlope = safetyNetData[1] - safetyNetData[0];
  const ssFalling = fundingSlope < 0; // SS failing if slope is negative
  safetyNetChart = new Chart(document.getElementById('safetyNetChart').getContext('2d'), {
    type: 'line',
    data: {
      labels: Array(safetyNetData.length).fill().map((_, i) => `Year ${i}`),
      datasets: [
        {
          label: 'SS & Medicare Funding ($T)',
          data: safetyNetData,
          borderColor: '#FF5733',
          fill: false
        },
        {
          label: 'Goal: $2.4T',
          data: goalData,
          borderColor: '#666666',
          borderWidth: 2,
          borderDash: [5, 5],
          pointRadius: 0,
          fill: false
        }
      ]
    },
    options: {
      scales: {
        y: {
          min: -5,
          max: 5,
          title: { display: true, text: 'Funding ($T)' },
          grid: {
            lineWidth: (context) => context.tick.value === 0 ? 2 : 1,
            color: (context) => context.tick.value === 0 ? '#000000' : '#e0e0e0'
          }
        },
        x: { title: { display: true, text: 'Years' } }
      },
      plugins: {
        failOverlay: { ssFalling } // Updated to slope-based
      }
    },
    plugins: [failPlugin]
  });
}

// Initial calc
calculateOutcomes();

// Update tax display
document.getElementById('taxRate').addEventListener('input', (e) => {
  document.getElementById('taxValue').textContent = `${e.target.value}%`;
  calculateOutcomes();
});

// Recalculate on any change
document.querySelectorAll('input').forEach(input => {
  input.addEventListener('change', calculateOutcomes);
});
