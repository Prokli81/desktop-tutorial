class LabelInfo {
  const LabelInfo({
    required this.raw,
    required this.typeCode,
    required this.model,
    required this.colorCode,
    required this.title,
  });

  final String raw;
  final String typeCode;
  final String model;
  final String colorCode;
  final String title;
}

class LabelParser {
  static const typeNames = {
    'KOM': 'Комод',
    'TUM': 'Тумба',
    'SHK': 'Шкаф',
    'HLD': 'Холодильник',
    'STL': 'Стол',
  };

  static const colorNames = {
    'DUB': 'Дуб',
    'BEL': 'Белый',
    'CHR': 'Чёрный',
    'WAL': 'Орех',
  };

  static LabelInfo parse(String code) {
    final raw = code.trim().toUpperCase();
    final parts = raw.split('-');
    final typeCode = parts.isNotEmpty ? parts[0] : '';
    final model = parts.length > 1 ? parts[1] : '';
    final colorCode = parts.length > 2 ? parts[2] : '';
    final typeName = typeNames[typeCode] ?? typeCode;
    final colorName = colorNames[colorCode] ?? colorCode;
    final title = [typeName, model, colorName].where((p) => p.isNotEmpty).join(' · ');

    return LabelInfo(
      raw: raw,
      typeCode: typeCode,
      model: model,
      colorCode: colorCode,
      title: title.isEmpty ? raw : title,
    );
  }
}
