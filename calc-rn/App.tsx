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
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operator, setOperator] = useState<Operator | null>(null);
  const [isEnteringNextValue, setIsEnteringNextValue] = useState(false);

  function inputNumber(value: string) {
    if (isEnteringNextValue) {
      setDisplay(value === "." ? "0." : value);
      setIsEnteringNextValue(false);
      return;
    }

    if (value === "." && display.includes(".")) return;
    if (display === "0" && value !== ".") {
      setDisplay(value);
      return;
    }

    setDisplay((prev) => prev + value);
  }

  function clearAll() {
    setDisplay("0");
    setPreviousValue(null);
    setOperator(null);
    setIsEnteringNextValue(false);
  }

  function deleteLast() {
    if (isEnteringNextValue) return;
    setDisplay((prev) => (prev.length === 1 ? "0" : prev.slice(0, -1)));
  }

  function runOperation(a: number, b: number, op: Operator): number {
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
  }

  function showError(error: unknown) {
    if (error instanceof Error && error.message) {
      setDisplay(error.message);
    } else {
      setDisplay("Error");
    }
    setPreviousValue(null);
    setOperator(null);
    setIsEnteringNextValue(true);
  }

  function formatNumber(value: number) {
    const text = value.toString();
    return text.length > 12 ? value.toPrecision(10) : text;
  }

  function chooseOperator(nextOperator: Operator) {
    const currentValue = Number(display);

    if (previousValue === null) {
      setPreviousValue(currentValue);
      setOperator(nextOperator);
      setIsEnteringNextValue(true);
      return;
    }

    if (operator && !isEnteringNextValue) {
      try {
        const result = runOperation(previousValue, currentValue, operator);
        setDisplay(formatNumber(result));
        setPreviousValue(result);
      } catch (error) {
        showError(error);
        return;
      }
    }

    setOperator(nextOperator);
    setIsEnteringNextValue(true);
  }

  function calculate() {
    if (!operator || previousValue === null || isEnteringNextValue) return;

    try {
      const result = runOperation(previousValue, Number(display), operator);
      setDisplay(formatNumber(result));
      setPreviousValue(null);
      setOperator(null);
      setIsEnteringNextValue(true);
    } catch (error) {
      showError(error);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.calculator}>
        <View style={styles.displayContainer}>
          <Text style={styles.operationText}>
            {previousValue !== null && operator ? `${previousValue} ${operator}` : " "}
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
