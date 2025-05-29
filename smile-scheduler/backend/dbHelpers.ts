//backend/dbHelpers.ts
import db from "./db";
import { RowDataPacket } from "mysql2/promise";

interface UserRow extends RowDataPacket {
  id: number;
  email: string;
  password: string;
  username: string;
}
export async function getUserByEmail(email: string) {
  console.log('🔍 [getUserByEmail] Looking up user with email:', email);

  const [rows] = await db.query<UserRow[]>("SELECT * FROM users WHERE email = ?", [email]);

  console.log('📄 [getUserByEmail] Query result:', rows);

  if (rows.length === 0) {
    console.warn('⚠️ [getUserByEmail] No user found with email:', email);
    return null;
  }

  const user = rows[0];
  return {
    id: user.id,
    email: user.email,
    password: user.password,
    username: user.username,
  };
}
