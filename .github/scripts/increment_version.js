const currentTag = process.argv[2];

if (!currentTag) {
  console.error("Please provide the current tag as a command line argument.");
  process.exit(1);
}

const [major, minor, patch] = currentTag.slice(1).split(".").map(Number);

if (isNaN(major) || isNaN(minor) || isNaN(patch)) {
  console.error(
    "Invalid tag format. Tags should follow Semantic Versioning (e.g., v1.2.3)."
  );
  process.exit(1);
}

const newTag = `v${major}.${minor}.${patch + 1}`;

console.log(newTag);
