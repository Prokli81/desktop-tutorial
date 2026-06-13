enum InvoiceType { inbound, outbound }

enum InvoiceStatus { pending, confirmed, deleted }

class InvoiceLine {
  InvoiceLine({
    required this.id,
    required this.labelCode,
    required this.title,
    required this.addedAt,
  });

  final String id;
  final String labelCode;
  final String title;
  final DateTime addedAt;

  Map<String, dynamic> toJson() => {
        'id': id,
        'labelCode': labelCode,
        'title': title,
        'addedAt': addedAt.toIso8601String(),
      };

  factory InvoiceLine.fromJson(Map<String, dynamic> json) => InvoiceLine(
        id: json['id'] as String,
        labelCode: json['labelCode'] as String,
        title: json['title'] as String,
        addedAt: DateTime.parse(json['addedAt'] as String),
      );
}

class Invoice {
  Invoice({
    required this.id,
    required this.type,
    required this.status,
    required this.lines,
    required this.createdAt,
    required this.updatedAt,
    this.orderNumber = '',
    this.client = '',
  });

  final String id;
  final InvoiceType type;
  InvoiceStatus status;
  final List<InvoiceLine> lines;
  final DateTime createdAt;
  DateTime updatedAt;
  String orderNumber;
  String client;

  Map<String, dynamic> toJson() => {
        'id': id,
        'type': type.name,
        'status': status.name,
        'lines': lines.map((l) => l.toJson()).toList(),
        'createdAt': createdAt.toIso8601String(),
        'updatedAt': updatedAt.toIso8601String(),
        'orderNumber': orderNumber,
        'client': client,
      };

  factory Invoice.fromJson(Map<String, dynamic> json) => Invoice(
        id: json['id'] as String,
        type: InvoiceType.values.byName(json['type'] as String),
        status: InvoiceStatus.values.byName(json['status'] as String),
        lines: (json['lines'] as List<dynamic>)
            .map((e) => InvoiceLine.fromJson(e as Map<String, dynamic>))
            .toList(),
        createdAt: DateTime.parse(json['createdAt'] as String),
        updatedAt: DateTime.parse(json['updatedAt'] as String),
        orderNumber: json['orderNumber'] as String? ?? '',
        client: json['client'] as String? ?? '',
      );
}
