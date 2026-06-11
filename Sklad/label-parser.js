const SkladLabelParser = (() => {
  function parse(code, rules) {
    const raw = String(code || "").trim().toUpperCase();
    if (!raw) {
      return { raw: "", typeCode: "", model: "", colorCode: "", typeName: "", colorName: "" };
    }

    const separator = rules?.separator || "-";
    const parts = raw.split(separator).map((part) => part.trim()).filter(Boolean);
    const keys = rules?.partLabels || ["type", "model", "color"];
    const map = {};

    keys.forEach((key, index) => {
      map[key] = parts[index] || "";
    });

    const typeCode = map.type || "";
    const model = map.model || "";
    const colorCode = map.color || "";

    return {
      raw,
      typeCode,
      model,
      colorCode,
      typeName: rules?.types?.[typeCode] || typeCode,
      colorName: rules?.colors?.[colorCode] || colorCode,
      title: [rules?.types?.[typeCode] || typeCode, model, rules?.colors?.[colorCode] || colorCode]
        .filter(Boolean)
        .join(" · "),
    };
  }

  return { parse };
})();
