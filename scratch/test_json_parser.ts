import { safeJsonParse } from "../lib/utils/jsonUtils";

const tests = [
  {
    name: "Standard valid JSON",
    input: '{"key": "value"}',
    expected: { key: "value" },
  },
  {
    name: "JSON with markdown blocks",
    input: "Here is your JSON:\n```json\n{\"foo\": \"bar\"}\n```\nHope it helps!",
    expected: { foo: "bar" },
  },
  {
    name: "Truncated JSON (missing closing brace)",
    input: '{"foo": "bar", "long": "this is a long string that ',
    expected: { foo: "bar", long: "this is a long string that " },
  },
  {
    name: "Truncated JSON (nested)",
    input: '{"foo": {"bar": "baz"',
    expected: { foo: { bar: "baz" } },
  },
  {
    name: "Invalid escaped single quotes",
    input: "{\"message\": \"Don\\'t panic\"}",
    expected: { message: "Don't panic" },
  },
  {
    name: "Bad escape sequence",
    input: '{"path": "C:\\Users\\name"}',
    expected: { path: "C:\\Users\\name" },
  },
];

console.log("Running JSON Parser Tests...\n");

let passed = 0;
for (const test of tests) {
  try {
    const result = safeJsonParse(test.input);
    const resultStr = JSON.stringify(result);
    const expectedStr = JSON.stringify(test.expected);

    if (resultStr === expectedStr) {
      console.log(`✅ PASSED: ${test.name}`);
      passed++;
    } else {
      console.log(`❌ FAILED: ${test.name}`);
      console.log(`   Expected: ${expectedStr}`);
      console.log(`   Got:      ${resultStr}`);
    }
  } catch (error: any) {
    console.log(`❌ ERROR: ${test.name} - ${error.message}`);
  }
}

console.log(`\nSummary: ${passed}/${tests.length} tests passed.`);
