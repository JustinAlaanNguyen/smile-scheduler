//backend/dbHelpers.ts
import db from "./db";
import { RowDataPacket } from "mysql2/promise";

interface UserRow extends RowDataPacket {
  id: number;
  email: string;
  password: string;
  username: string;
  email_verified: boolean;
}
export async function getUserByEmail(email: string) {

  try {
    const [rows] = await db.query<UserRow[]>(
      "SELECT * FROM smile_scheduler_db.users WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      console.warn("⚠️ [getUserByEmail] No user found with email:", email);
      return null;
    }

    const user = rows[0];
    return {
      id: user.id,
      email: user.email,
      password: user.password,
      username: user.username,
      email_verified: user.email_verified,
    };
  } catch (error) {
    console.error("❌ DB ERROR in getUserByEmail:", error);
    throw new Error("Database query failed");
  }
}
