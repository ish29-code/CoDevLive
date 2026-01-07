// controllers/problemController.js
import Problem from "../models/Problem.js";

/**
 * GET all problems (pattern-wise)
 * GET /api/problems
 */
export const getAllProblems = async (req, res) => {
    const problems = await Problem.find().select(
        "title difficulty pattern"
    );
    res.json(problems);
};

/**
 * GET single problem (LeetCode page)
 * GET /api/problems/:id
 */
export const getProblemById = async (req, res) => {
    const problem = await Problem.findById(req.params.id);

    if (!problem) {
        return res.status(404).json({ message: "Problem not found" });
    }

    res.json(problem);
};
