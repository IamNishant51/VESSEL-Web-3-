import { mkdir, access, copyFile, writeFile, readdir } from "node:fs/promises";
import { constants } from "node:fs";
import path from "node:path";

export async function ensureDir(dirPath: string): Promise<void> {
  await mkdir(dirPath, { recursive: true });
}

export async function pathExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

export async function writeJson(filePath: string, data: unknown): Promise<void> {
  await writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

export async function copyFileSafe(sourcePath: string, targetPath: string): Promise<void> {
  await ensureDir(path.dirname(targetPath));
  await copyFile(sourcePath, targetPath);
}

export async function readImageFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && /\.(png|jpe?g|webp)$/i.test(entry.name))
    .map((entry) => path.join(directory, entry.name));
}
