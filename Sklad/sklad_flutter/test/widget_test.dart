import 'package:flutter_test/flutter_test.dart';
import 'package:sklad_app/main.dart';

void main() {
  testWidgets('Sklad app starts', (WidgetTester tester) async {
    await tester.pumpWidget(const SkladApp());
    expect(find.text('Sklad — склад'), findsOneWidget);
  });
}
