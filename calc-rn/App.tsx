import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";

type Operator = "+" | "-" | "*" | "/";

type CalcButtonProps = {
  label: string;
  onPress: () => void;
  variant?: "number" | "operator" | "action";
  flex?: number;
};

function CalcButton({ label, onPress, variant = "number", flex = 1 }: CalcButtonProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.buttonBase,
        variant === "operator" && styles.buttonOperator,
        variant === "action" && styles.buttonAction,
        pressed && styles.buttonPressed,
        { flex },
      ]}
      onPress={onPress}
    >
      <Text style={styles.buttonLabel}>{label}</Text>
    </Pressable>
  );
}

export default function App() {
  const [display, setDisplay] = useState("0");
  const [firstValue, setFirstValue] = useState<number | null>(null);
  const [operator, setOperator] = useState<Operator | null>(null);
  const [waitingSecond, setWaitingSecond] = useState(false);

  const inputNumber = (value: string) => {
    if (waitingSecond) {
      setDisplay(value === "." ? "0." : value);
      setWaitingSecond(false);
      return;
    }

    if (value === "." && display.includes(".")) return;
    if (display === "0" && value !== ".") {
      setDisplay(value);
      return;
    }

    setDisplay((prev) => prev + value);
  };

  const clearAll = () => {
    setDisplay("0");
    setFirstValue(null);
    setOperator(null);
    setWaitingSecond(false);
  };

  const deleteLast = () => {
    if (waitingSecond) return;
    setDisplay((prev) => (prev.length === 1 ? "0" : prev.slice(0, -1)));
  };

  const runOperation = (a: number, b: number, op: Operator): number => {
    switch (op) {
      case "+":
        return a + b;
      case "-":
        return a - b;
      case "*":
        return a * b;
      case "/":
        if (b === 0) throw new Error("Cannot divide by zero");
        return a / b;
    }
  };

  const showError = (error: unknown) => {
    if (error instanceof Error && error.message) {
      setDisplay(error.message);
    } else {
      setDisplay("Error");
    }
    setFirstValue(null);
    setOperator(null);
    setWaitingSecond(true);
  };

  const formatNumber = (value: number) => {
    const text = value.toString();
    return text.length > 12 ? value.toPrecision(10) : text;
  };

  const chooseOperator = (nextOperator: Operator) => {
    const currentValue = Number(display);

    if (firstValue === null) {
      setFirstValue(currentValue);
      setOperator(nextOperator);
      setWaitingSecond(true);
      return;
    }

    if (operator && !waitingSecond) {
      try {
        const result = runOperation(firstValue, currentValue, operator);
        setDisplay(formatNumber(result));
        setFirstValue(result);
      } catch (error) {
        showError(error);
        return;
      }
    }

    setOperator(nextOperator);
    setWaitingSecond(true);
  };

  const calculate = () => {
    if (!operator || firstValue === null || waitingSecond) return;

    try {
      const result = runOperation(firstValue, Number(display), operator);
      setDisplay(formatNumber(result));
      setFirstValue(null);
      setOperator(null);
      setWaitingSecond(true);
    } catch (error) {
      showError(error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.calculator}>
        <View style={styles.displayContainer}>
          <Text style={styles.operationText}>
            {firstValue !== null && operator ? `${firstValue} ${operator}` : " "}
          </Text>
          <Text numberOfLines={1} adjustsFontSizeToFit style={styles.displayText}>
            {display}
          </Text>
        </View>

        <View style={styles.row}>
          <CalcButton label="C" onPress={clearAll} variant="action" />
          <CalcButton label="DEL" onPress={deleteLast} variant="action" />
          <CalcButton label="/" onPress={() => chooseOperator("/")} variant="operator" />
        </View>
        <View style={styles.row}>
          <CalcButton label="7" onPress={() => inputNumber("7")} />
          <CalcButton label="8" onPress={() => inputNumber("8")} />
          <CalcButton label="9" onPress={() => inputNumber("9")} />
          <CalcButton label="*" onPress={() => chooseOperator("*")} variant="operator" />
        </View>
        <View style={styles.row}>
          <CalcButton label="4" onPress={() => inputNumber("4")} />
          <CalcButton label="5" onPress={() => inputNumber("5")} />
          <CalcButton label="6" onPress={() => inputNumber("6")} />
          <CalcButton label="-" onPress={() => chooseOperator("-")} variant="operator" />
        </View>
        <View style={styles.row}>
          <CalcButton label="1" onPress={() => inputNumber("1")} />
          <CalcButton label="2" onPress={() => inputNumber("2")} />
          <CalcButton label="3" onPress={() => inputNumber("3")} />
          <CalcButton label="+" onPress={() => chooseOperator("+")} variant="operator" />
        </View>
        <View style={styles.row}>
          <CalcButton label="0" onPress={() => inputNumber("0")} flex={2} />
          <CalcButton label="." onPress={() => inputNumber(".")} />
          <CalcButton label="=" onPress={calculate} variant="operator" />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111827",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  calculator: {
    backgroundColor: "#1f2937",
    borderRadius: 16,
    padding: 14,
    gap: 10,
  },
  displayContainer: {
    backgroundColor: "#0f172a",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 18,
    marginBottom: 4,
    minHeight: 110,
    justifyContent: "space-between",
  },
  operationText: {
    color: "#94a3b8",
    fontSize: 18,
    textAlign: "right",
  },
  displayText: {
    color: "#f8fafc",
    fontSize: 42,
    fontWeight: "700",
    textAlign: "right",
  },
  row: {
    flexDirection: "row",
    gap: 10,
  },
  buttonBase: {
    minHeight: 68,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#334155",
  },
  buttonOperator: {
    backgroundColor: "#f97316",
  },
  buttonAction: {
    backgroundColor: "#475569",
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonLabel: {
    color: "#ffffff",
    fontSize: 26,
    fontWeight: "600",
  },
});
