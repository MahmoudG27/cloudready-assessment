# CloudReady Assessment

AI-powered Cloud Readiness Assessment Tool built on Azure for KlayyTech.
Helps sales engineers assess client cloud readiness and generate professional reports.

## Status
Phase 2 complete — planning and design done.
Phase 3 next — Infrastructure (Terraform + Azure setup).

## Docs
- `docs/architecture.md` — full architecture and tech stack
- `docs/assessment-questions.md` — 15 assessment questions + scoring logic
- `docs/report-structure.md` — 10-section report design decisions
- `docs/cosmos-schema.json` — Cosmos DB document schema
- `docs/prompts/system-prompt.txt` — Azure OpenAI system prompt
- `docs/prompts/user-prompt.txt` — Azure OpenAI user prompt template

1. اختار **Send an email (V2)**
2. سجل دخول بـ account بتاعك
3. في الـ **To** field حط:
```
@{triggerBody()?['to']}
```
4. **Subject**:
```
@{triggerBody()?['subject']}
```
5. **Body**:
```
Dear Client,

Your Cloud Readiness Report for @{triggerBody()?['companyName']} is ready.

Report ID: @{triggerBody()?['reportId']}

Download your report: @{triggerBody()?['reportUrl']}

Best regards,
KlayyTech Cloud Team
```


السؤال ده هو أهم سؤال فعلًا 👍 لأن قيمة المشروع مش في الكود… قيمته في **إزاي الشركة تستخدمه**.

خلّيني أجاوبك بشكل عملي ومباشر:
**إيه الطرق اللي KlayyTech ممكن تستفيد بيها من المشروع ده لو كمل؟**

---

# 🧠 1. تسريع عملية الـ Sales (أهم فايدة)

## قبل:

* Sales engineer يقعد مع العميل
* يسأل أسئلة
* يكتب notes
* يعمل proposal يدوي

⏱ بياخد ساعات أو أيام

---

## بعد المشروع:
* العميل يملأ assessment بنفسه
* التقرير يطلع تلقائي
✔ اختصار وقت ضخم
✔ تقدر تخدم clients أكتر بنفس الفريق

---

# 💰 2. زيادة عدد العملاء (Scaling)
بدل ما:
* كل sales يقدر يخدم 5–10 clients
يبقى:
* نفس الفريق يخدم 50–100 client

ليه؟
> لأن أول مرحلة (assessment) بقت automated

---

# 🎯 3. Lead Generation Tool
المشروع ممكن يتحول لـ:
> Landing page تجيب clients جدد
### flow:
1. Client يدخل يعمل assessment
2. ياخد report
3. يتشجع يكمل مع الشركة

✔ ده marketing + sales في نفس الوقت

---

# 📊 4. Data ذهبية للشركة

كل assessment بيتخزن في:
Azure Cosmos DB

ده معناه:

### الشركة تقدر تعرف:

* أغلب clients عندهم مشاكل فين؟
* جاهزين للـ cloud بنسبة كام؟
* industries الأكثر طلبًا

✔ قرارات business مبنية على data

---

# 🧱 5. Standardization (دي قوية جدًا)

دلوقتي:

* كل engineer بيشتغل بطريقته

بعد المشروع:

* كل assessments بنفس structure
* نفس scoring
* نفس recommendations

✔ جودة ثابتة
✔ تقليل الأخطاء

---

# 🤖 6. استخدام AI بشكل فعلي

باستخدام:
Azure OpenAI

الشركة تقدر:

* تولد reports احترافية
* أسرع بكتير من manual writing
* بنفس style كل مرة

✔ توفير وقت
✔ شكل احترافي قدام العميل

---

# 🧾 7. تقارير جاهزة للبيع

الـ report نفسه ممكن يبقى:

* PDF جاهز
* branded
* professional

✔ ممكن يتباع كخدمة لوحده
✔ أو يكون مدخل لخدمات أكبر

---

# 📈 8. Upselling & Cross-selling

بعد الـ assessment:

النظام ممكن يقول:

* محتاج Azure migration
* محتاج security upgrade
* محتاج DevOps setup

✔ الشركة تعرض خدمات إضافية بسهولة

---

# 🧑‍💼 9. تحسين تجربة العميل

بدل:

* calls كتير
* اجتماعات طويلة

يبقى:

* tool بسيط
* report واضح

✔ تجربة حديثة
✔ professional image

---

# 🏗 10. ممكن يتحول لمنتج (Product)

مش بس internal tool

ممكن يبقى:

* SaaS لشركات تانية
* white-label solution

---

# 🔥 11. Competitive Advantage

لو منافسينهم:

* بيشتغلوا manual

وهم:

* عندهم tool automated + AI

👉 ده فرق قوي في السوق

---

# 🧠 أهم Insight (ركز فيها)

قيمة المشروع مش في:

> "AI report"

القيمة الحقيقية في:

> **تحويل knowledge بتاع الشركة لنظام قابل للتكرار (system)**

---

# 🧾 الخلاصة

لو المشروع ده اتعمل صح، الشركة تستفيد في:

* ⏱ وقت أقل
* 💰 عملاء أكتر
* 📊 data أقوى
* 🤖 automation
* 🧱 standardization
* 🚀 growth أسرع

---

## 🔥 أهم جملة تاخدها معاك:
> المشروع ده ممكن يحوّل الـ sales من "manual service" إلى "scalable system"


terraform init
terraform plan -out=tfplan
terraform show tfplan
terraform apply tfplan