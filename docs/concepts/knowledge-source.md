# 🗂️ Knowledge Source

A Knowledge Source is the **origin of data**.

It does **not define behavior**, only provides access to data.
A Knowledge Source can be used by multiple engines.
---

## 📦 Examples of Knowledge Sources

* S3
* Cloud Storage
* Local File System
* PostgreSQL
* API
* YouTube
* GitHub

---

## 🧱 Source Types

Each source has a **data type**, which helps engines determine compatibility.

### Common types:

* **Files**

  * S3, Cloud Storage, Local FS

* **Tables**

  * PostgreSQL, MySQL

* **Media**

  * Video (YouTube)
  * Audio
  * Images

---

## ⚠️ Important Separation

👉 **Knowledge Source ≠ Knowledge Engine**

| Concept | Responsibility                 |
| ------- | ------------------------------ |
| Source  | Provides raw data              |
| Engine  | Understands and processes data |

---
