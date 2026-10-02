/**
 * Inserts sample tasks into the database, e.g. to check performance with
 * many tasks.
 *
 * Usage: npm run seed -- [count]   (default: 1000)
 */
import { getDatabasePath, openDatabase } from "../src/lib/db/connection";
import { createTaskRepository } from "../src/lib/tasks/repository";

const count = Number(process.argv[2] ?? 1000);
if (!Number.isInteger(count) || count < 1) {
  console.error("Count must be a positive integer.");
  process.exit(1);
}

const db = openDatabase(getDatabasePath());
const repo = createTaskRepository(db);

const verbs = ["Write", "Review", "Plan", "Fix", "Call", "Email", "Design", "Test", "Buy", "Clean"];
const nouns = ["report", "budget", "homepage", "bug", "client", "slides", "groceries", "garage", "API", "invoice"];

// One transaction for the whole batch: fast and all-or-nothing.
db.transaction(() => {
  for (let i = 1; i <= count; i++) {
    const verb = verbs[i % verbs.length];
    const noun = nouns[Math.floor(i / verbs.length) % nouns.length];
    repo.create({
      title: `${verb} ${noun} #${i}`,
      description: i % 3 === 0 ? "" : `Sample task ${i}: ${verb.toLowerCase()} the ${noun}.`,
    });
  }
})();

console.log(`Inserted ${count} tasks. Total: ${repo.count()}.`);
db.close();
