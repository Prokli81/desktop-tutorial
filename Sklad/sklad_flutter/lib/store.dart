import 'dart:convert';

import 'package:shared_preferences/shared_preferences.dart';

import 'label_parser.dart';
import 'models.dart';

class SkladStore {
  static const _key = 'sklad:flutter:v1';

  Future<List<Invoice>> loadInvoices() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_key);
    if (raw == null) return [];
    final list = jsonDecode(raw) as List<dynamic>;
    return list
        .map((e) => Invoice.fromJson(e as Map<String, dynamic>))
        .where((i) => i.status == InvoiceStatus.pending)
        .toList()
      ..sort((a, b) => b.updatedAt.compareTo(a.updatedAt));
  }

  Future<void> saveInvoices(List<Invoice> invoices) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(
      _key,
      jsonEncode(invoices.map((i) => i.toJson()).toList()),
    );
  }

  Future<Invoice> ensureActiveInvoice(InvoiceType type) async {
    final all = await _loadAll();
    final pending = all.where((i) => i.status == InvoiceStatus.pending && i.type == type);
    if (pending.isNotEmpty) return pending.first;

    final invoice = Invoice(
      id: 'inv-${DateTime.now().millisecondsSinceEpoch}',
      type: type,
      status: InvoiceStatus.pending,
      lines: [],
      createdAt: DateTime.now(),
      updatedAt: DateTime.now(),
    );
    all.insert(0, invoice);
    await saveInvoices(all);
    return invoice;
  }

  Future<void> addScan(InvoiceType type, String code) async {
    final info = LabelParser.parse(code);
    if (info.raw.isEmpty) return;

    final all = await _loadAll();
    final invoice = all.firstWhere(
      (i) => i.status == InvoiceStatus.pending && i.type == type,
      orElse: () {
        final created = Invoice(
          id: 'inv-${DateTime.now().millisecondsSinceEpoch}',
          type: type,
          status: InvoiceStatus.pending,
          lines: [],
          createdAt: DateTime.now(),
          updatedAt: DateTime.now(),
        );
        all.insert(0, created);
        return created;
      },
    );

    if (invoice.lines.any((l) => l.labelCode == info.raw)) return;

    invoice.lines.add(
      InvoiceLine(
        id: 'line-${DateTime.now().millisecondsSinceEpoch}',
        labelCode: info.raw,
        title: info.title,
        addedAt: DateTime.now(),
      ),
    );
    invoice.updatedAt = DateTime.now();
    await saveInvoices(all);
  }

  Future<List<Invoice>> _loadAll() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_key);
    if (raw == null) return [];
    final list = jsonDecode(raw) as List<dynamic>;
    return list.map((e) => Invoice.fromJson(e as Map<String, dynamic>)).toList();
  }
}
