const SkladStore = (() => {
  const DB_KEY = "sklad:db:v1";

  const seed = {
    labelRules: {
      separator: "-",
      partLabels: ["type", "model", "color"],
      types: {
        KOM: "Комод",
        TUM: "Тумба",
        SHK: "Шкаф",
        HLD: "Холодильник",
        STL: "Стол",
      },
      colors: {
        DUB: "Дуб",
        BEL: "Белый",
        CHR: "Чёрный",
        WAL: "Орех",
      },
    },
    products: [
      {
        id: "prod-kom-204-dub",
        typeCode: "KOM",
        model: "204",
        colorCode: "DUB",
        name: "Комод 204 дуб",
        category: "мебель",
        createdAt: "2026-06-10T08:00:00.000Z",
      },
      {
        id: "prod-hld-sx1",
        typeCode: "HLD",
        model: "SX1",
        colorCode: "CHR",
        name: "Холодильник SX1",
        category: "техника",
        createdAt: "2026-06-10T08:01:00.000Z",
      },
    ],
    units: [],
    invoices: [],
    movements: [],
  };

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function read() {
    const saved = localStorage.getItem(DB_KEY);
    if (!saved) {
      return clone(seed);
    }

    try {
      const parsed = JSON.parse(saved);
      return {
        ...clone(seed),
        ...parsed,
        labelRules: { ...clone(seed).labelRules, ...parsed.labelRules },
      };
    } catch {
      return clone(seed);
    }
  }

  function write(db) {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
    window.dispatchEvent(new CustomEvent("sklad:change", { detail: { db } }));
  }

  function update(mutator) {
    const db = read();
    mutator(db);
    write(db);
    return db;
  }

  function generateId(prefix) {
    return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
  }

  function listUnitsOnStock() {
    return read().units.filter((unit) => unit.status === "on_stock");
  }

  function stockSummary() {
    const groups = new Map();

    listUnitsOnStock().forEach((unit) => {
      const key = `${unit.typeCode}|${unit.model}|${unit.colorCode}`;
      const current = groups.get(key) || {
        typeCode: unit.typeCode,
        model: unit.model,
        colorCode: unit.colorCode,
        title: unit.title,
        count: 0,
      };
      current.count += 1;
      groups.set(key, current);
    });

    return [...groups.values()].sort((a, b) => a.title.localeCompare(b.title, "ru"));
  }

  function findUnitByLabel(labelCode) {
    const raw = String(labelCode || "").trim().toUpperCase();
    return read().units.find((unit) => unit.labelCode === raw) || null;
  }

  function findProductMatch(parsed) {
    return (
      read().products.find(
        (product) =>
          product.typeCode === parsed.typeCode &&
          product.model === parsed.model &&
          product.colorCode === parsed.colorCode,
      ) || null
    );
  }

  function pendingInvoices() {
    return read()
      .invoices.filter((invoice) => invoice.status === "pending")
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  function getInvoice(id) {
    return read().invoices.find((invoice) => invoice.id === id) || null;
  }

  function createInvoice(type, source = "phone") {
    const now = new Date().toISOString();
    const invoice = {
      id: generateId("inv"),
      type,
      status: "pending",
      orderNumber: "",
      client: "",
      lines: [],
      source,
      createdAt: now,
      updatedAt: now,
    };

    update((db) => {
      db.invoices.unshift(invoice);
    });

    return invoice;
  }

  function addLineToInvoice(invoiceId, labelCode) {
    const parsed = SkladLabelParser.parse(labelCode, read().labelRules);
    const product = findProductMatch(parsed);
    const existingUnit = findUnitByLabel(parsed.raw);
    let line = null;

    update((db) => {
      const invoice = db.invoices.find((item) => item.id === invoiceId);
      if (!invoice || invoice.status !== "pending") {
        return;
      }

      if (invoice.lines.some((item) => item.labelCode === parsed.raw)) {
        return;
      }

      line = {
        id: generateId("line"),
        labelCode: parsed.raw,
        typeCode: parsed.typeCode,
        model: parsed.model,
        colorCode: parsed.colorCode,
        title: parsed.title || parsed.raw,
        productId: product?.id || "",
        note: "",
        addedAt: new Date().toISOString(),
        stockStatus: existingUnit?.status || "new",
      };

      invoice.lines.push(line);
      invoice.updatedAt = new Date().toISOString();
    });

    return line;
  }

  function updateInvoice(invoiceId, patch) {
    update((db) => {
      const invoice = db.invoices.find((item) => item.id === invoiceId);
      if (!invoice) {
        return;
      }

      Object.assign(invoice, patch, { updatedAt: new Date().toISOString() });
    });
  }

  function removeLine(invoiceId, lineId) {
    update((db) => {
      const invoice = db.invoices.find((item) => item.id === invoiceId);
      if (!invoice || invoice.status !== "pending") {
        return;
      }

      invoice.lines = invoice.lines.filter((line) => line.id !== lineId);
      invoice.updatedAt = new Date().toISOString();
    });
  }

  function deleteInvoice(invoiceId) {
    update((db) => {
      const invoice = db.invoices.find((item) => item.id === invoiceId);
      if (!invoice || invoice.status !== "pending") {
        return;
      }

      invoice.status = "deleted";
      invoice.updatedAt = new Date().toISOString();
    });
  }

  function confirmInvoice(invoiceId) {
    const db = read();
    const invoice = db.invoices.find((item) => item.id === invoiceId);
    const errors = [];
    const now = new Date().toISOString();

    if (!invoice || invoice.status !== "pending") {
      return ["Накладная не найдена или уже обработана."];
    }

    if (!invoice.lines.length) {
      return ["В накладной нет позиций."];
    }

    if (invoice.type === "out") {
      if (!invoice.orderNumber?.trim()) {
        errors.push("Укажите номер заказа.");
      }
      if (!invoice.client?.trim()) {
        errors.push("Укажите клиента.");
      }

      invoice.lines.forEach((line) => {
        const unit = db.units.find((item) => item.labelCode === line.labelCode);
        if (!unit || unit.status !== "on_stock") {
          errors.push(`Нет на складе: ${line.labelCode}`);
        }
      });
    }

    if (errors.length) {
      return errors;
    }

    update((draft) => {
      const current = draft.invoices.find((item) => item.id === invoiceId);
      if (!current || current.status !== "pending") {
        return;
      }

      if (current.type === "in") {
        current.lines.forEach((line) => {
          let unit = draft.units.find((item) => item.labelCode === line.labelCode);
          if (!unit) {
            unit = {
              id: generateId("unit"),
              labelCode: line.labelCode,
              typeCode: line.typeCode,
              model: line.model,
              colorCode: line.colorCode,
              title: line.title,
              productId: line.productId,
              status: "on_stock",
              createdAt: now,
              updatedAt: now,
            };
            draft.units.push(unit);
          } else {
            unit.status = "on_stock";
            unit.updatedAt = now;
          }

          draft.movements.push({
            id: generateId("mov"),
            type: "in",
            labelCode: line.labelCode,
            title: line.title,
            invoiceId: current.id,
            createdAt: now,
          });
        });
      }

      if (current.type === "out") {
        current.lines.forEach((line) => {
          const unit = draft.units.find((item) => item.labelCode === line.labelCode);
          unit.status = "shipped";
          unit.updatedAt = now;

          draft.movements.push({
            id: generateId("mov"),
            type: "out",
            labelCode: line.labelCode,
            title: line.title,
            invoiceId: current.id,
            orderNumber: current.orderNumber,
            client: current.client,
            createdAt: now,
          });
        });
      }

      current.status = "confirmed";
      current.confirmedAt = now;
      current.updatedAt = now;
    });

    return [];
  }

  function upsertProduct(product) {
    update((db) => {
      const index = db.products.findIndex((item) => item.id === product.id);
      if (index >= 0) {
        db.products[index] = { ...db.products[index], ...product };
      } else {
        db.products.unshift({
          ...product,
          id: product.id || generateId("prod"),
          createdAt: product.createdAt || new Date().toISOString(),
        });
      }
    });
  }

  function deleteProduct(productId) {
    update((db) => {
      db.products = db.products.filter((item) => item.id !== productId);
    });
  }

  function saveLabelRules(rules) {
    update((db) => {
      db.labelRules = { ...db.labelRules, ...rules };
    });
  }

  function replaceDb(nextDb) {
    write({
      ...clone(seed),
      ...nextDb,
      labelRules: { ...clone(seed).labelRules, ...nextDb.labelRules },
    });
  }

  function resetDemo() {
    localStorage.removeItem(DB_KEY);
    window.dispatchEvent(new CustomEvent("sklad:change", { detail: { db: read() } }));
  }

  return {
    addLineToInvoice,
    confirmInvoice,
    createInvoice,
    deleteInvoice,
    deleteProduct,
    findUnitByLabel,
    generateId,
    getInvoice,
    listUnitsOnStock,
    pendingInvoices,
    read,
    removeLine,
    replaceDb,
    resetDemo,
    saveLabelRules,
    stockSummary,
    updateInvoice,
    upsertProduct,
    update,
  };
})();
