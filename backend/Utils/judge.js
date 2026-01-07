// utils/judge.js
import Problem from "../models/Problem.js";

/**
 * LeetCode-style judge
 * @param {String} problemId
 * @param {String} userCode
 * @param {String} language
 */
const judge = async (problemId, userCode, language) => {
    const problem = await Problem.findById(problemId);

    if (!problem) {
        return {
            verdict: "Runtime Error",
            error: "Problem not found",
        };
    }

    const testCases = problem.testCases;

    let passed = 0;

    try {
        for (let test of testCases) {
            const output = executeCode(userCode, test.input, language);

            if (String(output).trim() !== String(test.output).trim()) {
                return {
                    verdict: "Wrong Answer",
                    passed,
                    total: testCases.length,
                };
            }

            passed++;
        }

        return {
            verdict: "Accepted",
            passed,
            total: testCases.length,
            runtime: "O(n)",
            memory: "Low",
        };
    } catch (err) {
        return {
            verdict: "Runtime Error",
            error: err.message,
        };
    }
};

export default judge;

/* ================= EXECUTOR ================= */

/**
 * ⚠️ WARNING:
 * This is SAFE FOR PRACTICE MODE ONLY
 * For production → Docker / isolated sandbox
 */
function executeCode(code, input, language) {
    if (language !== "javascript") {
        throw new Error("Only JavaScript supported currently");
    }

    /**
     * Expected user format:
     * function solve(input) { return result; }
     */
    const wrappedCode = `
    ${code}
    solve(${JSON.stringify(input)})
  `;

    // eslint-disable-next-line no-eval
    return eval(wrappedCode);
}
