---
description: Commit staged changes, push the current branch, and open a PR
allowed-tools: Bash(git status:*), Bash(git diff:*), Bash(git branch:*), Bash(git checkout:*), Bash(git commit:*), Bash(git push origin:*), Bash(gh pr create:*)
---

Follow these steps in order. Extra instructions from the user: $ARGUMENTS

1. Run `git status` to show what will be committed.
2. Run `git diff --staged` to see the staged changes.
3. Run `git branch --show-current`. If the current branch is `main`, create and switch to a new descriptive branch based on the staged changes with `git checkout -b <branch-name>`. Staged changes carry over. Otherwise stay on the current branch.
4. Write a commit message based on what is staged.
5. Run `git commit -m "<message>"` with that message.
6. Run `git push origin <current-branch>`, using the current branch name (the new one if you created it in step 3).
7. Run `gh pr create --fill --body "<message>"`, using the commit message as the body.

If any step fails, stop and report the error.
