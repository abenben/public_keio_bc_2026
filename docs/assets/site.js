const yen = new Intl.NumberFormat("ja-JP", { maximumFractionDigits: 0 });
const fixed = (value, digits = 2) => Number(value).toFixed(digits);

function setupAmmDemo() {
  const root = document.querySelector("[data-demo='amm']");
  if (!root) return;

  const state = {
    eth: 100,
    usdc: 300000,
    initialEth: 100,
    initialUsdc: 300000
  };

  const els = {
    eth: root.querySelector("[data-eth]"),
    usdc: root.querySelector("[data-usdc]"),
    price: root.querySelector("[data-price]"),
    k: root.querySelector("[data-k]"),
    slippage: root.querySelector("[data-slippage]"),
    ethFill: root.querySelector("[data-eth-fill]"),
    usdcFill: root.querySelector("[data-usdc-fill]"),
    result: root.querySelector("[data-result]"),
    amount: root.querySelector("[data-amount]"),
    action: root.querySelector("[data-action]")
  };

  function price() {
    return state.usdc / state.eth;
  }

  function render(message, tone = "insight") {
    const p = price();
    const slippage = ((p - 3000) / 3000) * 100;
    els.eth.textContent = `${fixed(state.eth, 2)} ETH`;
    els.usdc.textContent = `${yen.format(state.usdc)} USDC`;
    els.price.textContent = `1 ETH = ${yen.format(p)} USDC`;
    els.k.textContent = yen.format(state.eth * state.usdc);
    els.slippage.textContent = `${slippage >= 0 ? "+" : ""}${fixed(slippage, 1)}%`;
    els.ethFill.style.height = `${Math.max(7, Math.min(100, (state.eth / state.initialEth) * 100))}%`;
    els.usdcFill.style.height = `${Math.max(7, Math.min(100, (state.usdc / state.initialUsdc) * 100))}%`;
    els.result.className = `insight ${tone}`;
    els.result.textContent = message;
  }

  function trade() {
    const amount = Math.max(1, Number(els.amount.value || 0));
    const k = state.eth * state.usdc;
    const before = price();

    if (els.action.value === "buy") {
      const newUsdc = state.usdc + amount;
      const newEth = k / newUsdc;
      const outEth = state.eth - newEth;
      state.usdc = newUsdc;
      state.eth = newEth;
      const tone = state.eth < 25 ? "risk" : "insight";
      render(`USDCを入れるとETHの残量が減り、受け取れるETHは ${fixed(outEth, 4)} ETH になりました。プールが薄くなるほど価格は急に動きます。`, tone);
    } else {
      const ethIn = amount / before;
      const newEth = state.eth + ethIn;
      const newUsdc = k / newEth;
      const outUsdc = state.usdc - newUsdc;
      state.eth = newEth;
      state.usdc = newUsdc;
      const tone = state.usdc < 75000 ? "risk" : "success";
      render(`ETHを売るとUSDCの残量が減り、受け取れるUSDCは ${yen.format(outUsdc)} USDC になりました。流動性が枯れると取引条件が悪化します。`, tone);
    }
  }

  root.querySelector("[data-trade]").addEventListener("click", trade);
  root.querySelector("[data-stress]").addEventListener("click", () => {
    els.action.value = "sell";
    els.amount.value = 1200000;
    trade();
  });
  root.querySelector("[data-reset]").addEventListener("click", () => {
    state.eth = state.initialEth;
    state.usdc = state.initialUsdc;
    els.amount.value = 30000;
    els.action.value = "buy";
    render("初期状態です。x * y = k を保つので、片方の残量が減るほど価格が大きく動きます。", "insight");
  });

  render("初期状態です。x * y = k を保つので、片方の残量が減るほど価格が大きく動きます。", "insight");
}

function setupDaoDemo() {
  const root = document.querySelector("[data-demo='dao']");
  if (!root) return;

  const scenarios = {
    balanced: {
      label: "幅広い参加",
      voters: [
        ["大口A", 28, "yes"],
        ["利用者B", 18, "yes"],
        ["開発者C", 16, "no"],
        ["学生D", 10, "yes"],
        ["小口参加者", 22, "no"]
      ]
    },
    whale: {
      label: "大口支配",
      voters: [
        ["大口A", 61, "yes"],
        ["利用者B", 11, "no"],
        ["開発者C", 9, "no"],
        ["学生D", 6, "no"],
        ["小口参加者", 5, "no"]
      ]
    },
    low: {
      label: "低投票率",
      voters: [
        ["大口A", 28, "none"],
        ["利用者B", 18, "yes"],
        ["開発者C", 16, "none"],
        ["学生D", 10, "no"],
        ["小口参加者", 22, "none"]
      ]
    }
  };

  const els = {
    scenario: root.querySelector("[data-scenario]"),
    list: root.querySelector("[data-voters]"),
    yes: root.querySelector("[data-yes]"),
    no: root.querySelector("[data-no]"),
    turnout: root.querySelector("[data-turnout]"),
    meterYes: root.querySelector("[data-meter-yes]"),
    meterNo: root.querySelector("[data-meter-no]"),
    result: root.querySelector("[data-result]")
  };

  function render() {
    const scenario = scenarios[els.scenario.value];
    let yes = 0;
    let no = 0;
    let turnout = 0;
    els.list.innerHTML = "";

    scenario.voters.forEach(([name, share, vote]) => {
      if (vote === "yes") yes += share;
      if (vote === "no") no += share;
      if (vote !== "none") turnout += share;

      const row = document.createElement("div");
      row.className = "voter-row";
      row.innerHTML = `
        <strong>${name}</strong>
        <div class="bar-track"><div class="bar-fill" style="width:${share}%"></div></div>
        <span>${share}%</span>
      `;
      els.list.appendChild(row);
    });

    const decided = yes + no || 1;
    const yesPct = (yes / decided) * 100;
    const noPct = (no / decided) * 100;
    els.yes.textContent = `${yes}%`;
    els.no.textContent = `${no}%`;
    els.turnout.textContent = `${turnout}%`;
    els.meterYes.style.width = `${yesPct}%`;
    els.meterNo.style.width = `${noPct}%`;
    els.meterYes.textContent = `賛成 ${fixed(yesPct, 0)}%`;
    els.meterNo.textContent = `反対 ${fixed(noPct, 0)}%`;

    let text = "提案は可決されました。ただし、誰が参加し、誰が参加していないかを見る必要があります。";
    let tone = "success";
    if (els.scenario.value === "whale") {
      text = "可決でも、大口1名の賛成だけで結果がほぼ決まっています。形式上の投票と実質的な支配を分けて見る必要があります。";
      tone = "risk";
    }
    if (els.scenario.value === "low") {
      text = "投票した人だけを見ると結果は出ますが、参加率が低いと共同体の意思と呼べるかが問題になります。";
      tone = "risk";
    }
    els.result.className = `insight ${tone}`;
    els.result.textContent = text;
  }

  els.scenario.addEventListener("change", render);
  render();
}

function setupGlossary() {
  const root = document.querySelector("[data-glossary]");
  if (!root) return;

  const search = root.querySelector("[data-search]");
  const tabs = [...root.querySelectorAll(".category-tabs [data-category]")];
  const cards = [...root.querySelectorAll("[data-term-card]")];

  function filter() {
    const query = search.value.trim().toLowerCase();
    const category = tabs.find((tab) => tab.classList.contains("active"))?.dataset.category || "all";
    cards.forEach((card) => {
      const text = card.textContent.toLowerCase();
      const matchesQuery = !query || text.includes(query);
      const matchesCategory = category === "all" || card.dataset.category === category;
      card.hidden = !(matchesQuery && matchesCategory);
    });
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((item) => item.classList.remove("active"));
      tab.classList.add("active");
      filter();
    });
  });
  search.addEventListener("input", filter);
  filter();
}

setupAmmDemo();
setupDaoDemo();
setupGlossary();
