import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart';

import '../label_parser.dart';
import '../models.dart';
import '../store.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final _store = SkladStore();
  final _manualController = TextEditingController();
  final _scannerController = MobileScannerController(
    detectionSpeed: DetectionSpeed.normal,
    facing: CameraFacing.back,
  );

  InvoiceType _type = InvoiceType.inbound;
  List<Invoice> _invoices = [];
  String? _lastCode;
  DateTime? _lastAt;

  @override
  void initState() {
    super.initState();
    _reload();
  }

  @override
  void dispose() {
    _manualController.dispose();
    _scannerController.dispose();
    super.dispose();
  }

  Future<void> _reload() async {
    final invoices = await _store.loadInvoices();
    if (!mounted) return;
    setState(() => _invoices = invoices);
  }

  Future<void> _handleCode(String code) async {
    final normalized = code.trim().toUpperCase();
    if (normalized.isEmpty) return;

    final now = DateTime.now();
    if (_lastCode == normalized && _lastAt != null && now.difference(_lastAt!).inMilliseconds < 1800) {
      return;
    }
    _lastCode = normalized;
    _lastAt = now;

    await _store.addScan(_type, normalized);
    await _reload();

    if (!mounted) return;
    final info = LabelParser.parse(normalized);
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Добавлено: ${info.title}')),
    );
  }

  Invoice? get _activeInvoice {
    try {
      return _invoices.firstWhere((i) => i.type == _type);
    } catch (_) {
      return null;
    }
  }

  @override
  Widget build(BuildContext context) {
    final active = _activeInvoice;
    final typeLabel = _type == InvoiceType.inbound ? 'Приёмка' : 'Отгрузка';

    return Scaffold(
      appBar: AppBar(
        title: const Text('Sklad — склад'),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 12),
            child: Chip(label: Text(typeLabel)),
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          SegmentedButton<InvoiceType>(
            segments: const [
              ButtonSegment(value: InvoiceType.inbound, label: Text('Приёмка')),
              ButtonSegment(value: InvoiceType.outbound, label: Text('Отгрузка')),
            ],
            selected: {_type},
            onSelectionChanged: (value) {
              setState(() => _type = value.first);
              _reload();
            },
          ),
          const SizedBox(height: 12),
          Text(
            'Сканируйте этикетку. Подтверждение накладной — на ПК (http://localhost:4174).',
            style: Theme.of(context).textTheme.bodyMedium,
          ),
          const SizedBox(height: 12),
          ClipRRect(
            borderRadius: BorderRadius.circular(16),
            child: SizedBox(
              height: 260,
              child: MobileScanner(
                controller: _scannerController,
                onDetect: (capture) {
                  final barcodes = capture.barcodes;
                  if (barcodes.isEmpty) return;
                  final code = barcodes.first.rawValue;
                  if (code != null) _handleCode(code);
                },
              ),
            ),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: TextField(
                  controller: _manualController,
                  decoration: const InputDecoration(
                    labelText: 'Код вручную',
                    hintText: 'KOM-204-DUB',
                    border: OutlineInputBorder(),
                  ),
                  textCapitalization: TextCapitalization.characters,
                  onSubmitted: _handleCode,
                ),
              ),
              const SizedBox(width: 8),
              FilledButton(
                onPressed: () => _handleCode(_manualController.text),
                child: const Text('Добавить'),
              ),
            ],
          ),
          const SizedBox(height: 20),
          Text('Текущая накладная ($typeLabel)', style: Theme.of(context).textTheme.titleMedium),
          const SizedBox(height: 8),
          if (active == null || active.lines.isEmpty)
            const Text('Пока нет позиций — отсканируйте этикетку.')
          else
            ...active.lines.map(
              (line) => Card(
                child: ListTile(
                  title: Text(line.title),
                  subtitle: Text(line.labelCode),
                ),
              ),
            ),
          const SizedBox(height: 16),
          Card(
            color: Theme.of(context).colorScheme.surfaceContainerHighest,
            child: const Padding(
              padding: EdgeInsets.all(12),
              child: Text(
                'Данные на телефоне пока отдельно от браузера на ПК. '
                'Облако (Firebase) подключим на следующем этапе.',
              ),
            ),
          ),
        ],
      ),
    );
  }
}
