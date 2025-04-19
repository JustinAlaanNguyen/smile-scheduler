
import db from "./db";

export async function getUserByEmail(email: string) {
    const [rows]: any = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (rows.length === 0) return null;
  
    //id, email, password, username columns
    const user = rows[0];
    return {
      id: user.id,
      email: user.email,
      password: user.password,
      username: user.username,
    };
}
