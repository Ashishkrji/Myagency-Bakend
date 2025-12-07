export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ message: "Method not allowed" });

  const { username, password } = req.body;

  // Example login check
  if (username === "ashish@myagency.com" && password === "Maajanki@2025") {
    return res.status(200).json({ token: "fake-jwt-token" });
  }

  res.status(401).json({ message: "Invalid credentials" });
}
