/* Elit Global Partners — client-side financial estimates, no external dependencies. */
(() => {
  "use strict";
  const track = document.getElementById("fc-track");
  if (!track) return;
  const slides = Array.from(track.querySelectorAll(".fc-slide"));
  const tabs = Array.from(document.querySelectorAll(".fc-tab"));
  const dots = Array.from(document.querySelectorAll(".fc-dots span"));
  const prev = document.getElementById("fc-prev");
  const next = document.getElementById("fc-next");
  const position = document.getElementById("fc-position");
  const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let current = 0;

  const money = (value) => Number.isFinite(value) ? new Intl.NumberFormat("en-CA", {
    style: "currency", currency: "CAD", maximumFractionDigits: 0
  }).format(value) : "—";
  const count = (n) => Number.isFinite(n) ? Math.round(n).toLocaleString("en-CA") : "—";
  const field = (id) => Number(document.getElementById(id).value);

  const updateSlideSelection = (index) => {
    current = Math.max(0, Math.min(slides.length - 1, index));
    tabs.forEach((t, i) => {
      t.classList.toggle("is-selected", i === current);
      if (i === current) t.setAttribute("aria-current", "true");
      else t.removeAttribute("aria-current");
    });
    dots.forEach((dot, i) => dot.classList.toggle("is-active", i === current));
    position.textContent = String(current + 1).padStart(2, "0") + " / 05";
    prev.disabled = current === 0;
    next.disabled = current === slides.length - 1;
  };
  const go = (index) => {
    const i = Math.max(0, Math.min(slides.length - 1, index));
    updateSlideSelection(i);
    track.scrollTo({ left: slides[i].offsetLeft - slides[0].offsetLeft, behavior: reduceMotion ? "auto" : "smooth" });
  };
  tabs.forEach((tab, i) => tab.addEventListener("click", () => go(i)));
  prev.addEventListener("click", () => go(current - 1));
  next.addEventListener("click", () => go(current + 1));
  let framePending = false;
  track.addEventListener("scroll", () => {
    if (framePending) return;
    framePending = true;
    window.requestAnimationFrame(() => {
      const i = Math.round(track.scrollLeft / Math.max(1, track.clientWidth));
      updateSlideSelection(i);
      framePending = false;
    });
  }, {passive:true});
  track.addEventListener("keydown", (e) => {
    if (e.target.closest("input,select,textarea,button")) return;
    if (e.key === "ArrowRight") { e.preventDefault(); go(current + 1); }
    if (e.key === "ArrowLeft") { e.preventDefault(); go(current - 1); }
  });

  const setError = (id, message) => {
    const e = document.querySelector('[data-error="' + id + '"]');
    const primary = document.getElementById(id + "-main");
    const details = document.getElementById(id + "-details");
    const caption = document.getElementById(id + "-caption");
    if (e) { e.textContent = message || ""; e.hidden = !message; }
    if (message) { primary.textContent = "—"; details.replaceChildren(); caption.textContent = "Adjust the inputs to view your estimate."; }
  };
  const show = (id, main, caption, lines) => {
    setError(id, "");
    document.getElementById(id + "-main").textContent = main;
    document.getElementById(id + "-caption").textContent = caption;
    const box = document.getElementById(id + "-details");
    box.replaceChildren();
    lines.forEach(([label, value]) => {
      const row = document.createElement("div");
      row.className = "fc-result-line";
      const l = document.createElement("span"), v = document.createElement("b");
      l.textContent = label; v.textContent = String(value);
      row.append(l, v);
      box.append(row);
    });
  };
  const valid = (key) => {
    const form = document.querySelector('[data-form="' + key + '"]');
    for (const input of form.querySelectorAll("input")) {
      if (input.value.trim() === "" || !input.checkValidity() || !Number.isFinite(Number(input.value))) {
        setError(key, "Enter a valid value for " + input.closest("label").querySelector("span").textContent + ".");
        return false;
      }
    }
    return true;
  };
  const monthlyPay = (balance, annualPercent, months, canadianMortgage) => {
    if (months <= 0) return NaN;
    const rate = canadianMortgage ? Math.pow(1 + annualPercent / 200, 1 / 6) - 1 : annualPercent / 1200;
    if (Math.abs(rate) < 1e-12) return balance / months;
    return balance * rate / (1 - Math.pow(1 + rate, -months));
  };
  const futureValue = (start, monthly, aprPercent, months) => {
    const r = aprPercent / 1200;
    const growth = Math.pow(1 + r, months);
    const factor = Math.abs(r) < 1e-12 ? months : (growth - 1) / r;
    return { value: start * growth + monthly * factor, factor, growth };
  };
  const mortgage = () => {
    if (!valid("mortgage")) return;
    const price = field("m-price"), down = field("m-down"), rate = field("m-rate");
    const years = field("m-years"), tax = field("m-tax"), insurance = field("m-home");
    const principal = price * (1 - down / 100);
    const months = Math.round(years * 12);
    const payment = monthlyPay(principal, rate, months, true);
    const total = payment + tax / 12 + insurance;
    if (![principal, payment, total].every(Number.isFinite)) return setError("mortgage", "These values produce an estimate outside the supported range.");
    show("mortgage", money(total), "Estimated total monthly housing cost", [
      ["Monthly mortgage payment", money(payment)],
      ["Property tax per month", money(tax / 12)],
      ["Home insurance per month", money(insurance)],
      ["Mortgage principal", money(principal)],
      ["Interest over amortization", money(Math.max(0, payment * months - principal))]
    ]);
  };
  const compound = () => {
    if (!valid("compound")) return;
    const start = field("c-start"), monthly = field("c-monthly"), years = field("c-years"), rate = field("c-rate");
    const months = Math.round(years * 12), fv = futureValue(start, monthly, rate, months).value;
    const invested = start + monthly * months;
    if (!Number.isFinite(fv)) return setError("compound", "Please use smaller amounts or a shorter investment period.");
    show("compound", money(fv), "Projected investment value after " + years + " years", [
      ["Initial investment", money(start)],
      ["Total monthly contributions", money(monthly * months)],
      ["Estimated growth / loss", money(fv - invested)],
      ["Total contributions", money(invested)]
    ]);
  };
  const retirement = () => {
    if (!valid("retirement")) return;
    const age = field("r-age"), retire = field("r-retire");
    if (retire <= age) return setError("retirement", "Retirement age must be greater than your current age.");
    const years = retire - age, months = years * 12, savings = field("r-savings"), monthly = field("r-monthly");
    const desired = field("r-need"), rate = field("r-return"), inflation = field("r-inflation"), withdrawal = field("r-withdraw");
    const projectedData = futureValue(savings, monthly, rate, months);
    const projected = projectedData.value;
    const incomeAtRetirement = desired * Math.pow(1 + inflation / 100, years);
    const goal = incomeAtRetirement * 12 / (withdrawal / 100);
    const diff = Math.max(0, goal - projected);
    const requiredMonthly = projectedData.factor > 0 ? Math.max(0, (goal - savings * projectedData.growth) / projectedData.factor) : 0;
    if (![projected, goal, diff, requiredMonthly].every(Number.isFinite)) return setError("retirement", "Please use smaller values for a realistic projection.");
    show("retirement", money(projected), "Estimated savings by age " + retire, [
      ["Illustrative retirement target", money(goal)],
      ["Monthly income target at retirement", money(incomeAtRetirement)],
      ["Estimated savings gap", money(diff)],
      ["Extra monthly savings to target", money(Math.max(0, requiredMonthly - monthly))],
      ["Status", diff <= 0 ? "On track in this model" : "Below target in this model"]
    ]);
  };
  const simulateDebt = (balance, apr, payment) => {
    if (balance <= 0) return { months: 0, interest: 0 };
    let current = balance, totalInterest = 0;
    const monthlyRate = apr / 1200;
    if (payment <= current * monthlyRate + 0.0000001) return null;
    for (let month = 1; month <= 1200; month++) {
      const interest = current * monthlyRate;
      current += interest;
      totalInterest += interest;
      current -= Math.min(current, payment);
      if (current <= 0.000001) return { months: month, interest: totalInterest };
    }
    return null;
  };
  const debt = () => {
    if (!valid("debt")) return;
    const balance = field("d-balance"), apr = field("d-rate");
    const regular = field("d-payment"), extra = field("d-extra"), payment = regular + extra;
    if (payment <= 0) return setError("debt", "Monthly payment must be greater than zero.");
    const result = simulateDebt(balance, apr, payment);
    if (!result) return setError("debt", "This payment cannot fully repay the balance within 100 years. Increase your payment to cover interest and principal.");
    const base = regular > 0 ? simulateDebt(balance, apr, regular) : null;
    const date = new Date(new Date().getFullYear(), new Date().getMonth() + result.months, 1);
    const dateText = date.toLocaleDateString("en-CA", { month: "long", year: "numeric" });
    const duration = Math.floor(result.months / 12) ? Math.floor(result.months / 12) + " yr " + (result.months % 12) + " mo" : result.months + " mo";
    show("debt", duration, "Estimated payoff date: " + dateText, [
      ["Monthly payment (including extra)", money(payment)],
      ["Estimated total interest", money(result.interest)],
      ["Estimated total repayment", money(balance + result.interest)],
      ["Time saved with extra", base ? count(Math.max(0, base.months - result.months)) + " months" : "—"],
      ["Interest saved with extra", base ? money(Math.max(0, base.interest - result.interest)) : "—"]
    ]);
  };
  const life = () => {
    if (!valid("life")) return;
    const income = field("l-income") * field("l-years");
    const debts = field("l-mortgage") + field("l-other"), family = field("l-education") + field("l-final");
    const existing = field("l-existing") + field("l-assets");
    const totalNeed = income + debts + family;
    const gap = Math.max(0, totalNeed - existing);
    show("life", money(gap), "Estimated additional life insurance coverage needed", [
      ["Income replacement", money(income)],
      ["Debts to cover", money(debts)],
      ["Education and final expenses", money(family)],
      ["Existing coverage and available savings", "−" + money(existing)],
      ["Total estimated needs before offsets", money(totalNeed)]
    ]);
  };

  const calculators = { mortgage, compound, retirement, debt, life };
  document.querySelectorAll(".fc-form").forEach((form) => {
    const key = form.getAttribute("data-form");
    form.addEventListener("submit", (event) => event.preventDefault());
    form.addEventListener("input", () => calculators[key]());
    form.addEventListener("change", () => calculators[key]());
  });
  Object.values(calculators).forEach(fn => fn());
  updateSlideSelection(0);
})();
