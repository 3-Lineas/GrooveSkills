# Flutter Layers, Atomic Actions & Riverpod State

## 1. Pure HTTP Adapter (`lib/adapters/orders/fetch_orders_adapter.dart`)
Adapters wrap `package:http` with explicit timeouts, status-code validation, and `AppError` mapping—zero `Ref` or Riverpod imports:

```dart
import 'dart:async';
import 'dart:convert';
import 'package:http/http.dart' as http;

class FetchOrdersAdapter {
  const FetchOrdersAdapter({required this.httpClient, required this.baseUrl});

  final http.Client httpClient;
  final String baseUrl;

  Future<List<OrderSummary>> fetchOrders({required String authToken}) async {
    final Uri requestUri = Uri.parse('$baseUrl/orders');
    final http.Response response = await httpClient
        .get(requestUri, headers: {'Authorization': 'Bearer $authToken'})
        .timeout(const Duration(seconds: 10));

    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw NetworkError(statusCode: response.statusCode);
    }

    final Object? decoded = jsonDecode(response.body);
    if (decoded is! List<Object?>) {
      throw const FormatException('Expected a JSON list of orders.');
    }
    return decoded.map(parseOrderSummary).toList(growable: false);
  }
}
```

## 2. Atomic Action (`lib/actions/orders/load_orders_action.dart`)
Max 1 external call per Action; returns `DomainResult`:

```dart
class LoadOrdersAction {
  const LoadOrdersAction(this.ordersAdapter);

  final FetchOrdersAdapter ordersAdapter;

  Future<DomainResult<List<OrderSummary>, AppError>> execute({
    required String authToken,
  }) async {
    try {
      final List<OrderSummary> orders =
          await ordersAdapter.fetchOrders(authToken: authToken);
      return SuccessResult(orders);
    } on TimeoutException {
      return const FailureResult(
        NetworkError(userMessage: 'The request timed out. Please try again.'),
      );
    } on AppError catch (domainError) {
      return FailureResult(domainError);
    }
  }
}
```

## 3. Riverpod `AsyncNotifier` (`lib/providers/orders/orders_notifier.dart`)
```dart
class OrdersNotifier extends AsyncNotifier<List<OrderSummary>> {
  @override
  Future<List<OrderSummary>> build() async {
    final LoadOrdersAction loadOrders = ref.watch(loadOrdersActionProvider);
    final String authToken = ref.watch(authTokenProvider);
    final DomainResult<List<OrderSummary>, AppError> result =
        await loadOrders.execute(authToken: authToken);

    return switch (result) {
      SuccessResult(:final value) => value,
      FailureResult(:final error) => throw error,
    };
  }

  Future<void> refreshOrders() async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() => build());
  }
}
```

## 4. Thin `ConsumerWidget` View (`lib/ui/orders/orders_screen.dart`)
```dart
class OrdersScreen extends ConsumerWidget {
  const OrdersScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final AsyncValue<List<OrderSummary>> ordersState =
        ref.watch(ordersProvider);

    return switch (ordersState) {
      AsyncData(:final value) => OrdersListView(orders: value),
      AsyncError(:final error) => ErrorRetryView(
          message: error.toString(),
          onRetry: () => ref.read(ordersProvider.notifier).refreshOrders(),
        ),
      _ => const Center(child: CircularProgressIndicator()),
    };
  }
}
```
