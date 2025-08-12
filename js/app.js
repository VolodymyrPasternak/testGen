// Мапа генераторів
const generators = {
  assa: {
    inner: generateAssaAbloyInnerLablePDF,
    outer: generateAssaAbloyOuterLablePDF,
  },
  tls: {
    inner: generateTlsInnerLablePDF,
    outer: generateTlsOuterLablePDF,
  },
  ncl: {
    inner: generateNclInnerLablePDF,
    outer: generateNclOuterLablePDF,
  },
};

// показ/приховування форм
function showForm(templateKey) {
  document.querySelectorAll('.labels__form').forEach(el => el.classList.remove('isShow'));
  const form = document.querySelector(`.labels__form.${templateKey}`);
  if (form) form.classList.add('isShow');

  // (опційно) вмикаємо/вимикаємо кнопки, якщо для шаблону немає генераторів
  const has = Boolean(generators[templateKey]);
  btnInner.disabled = !has;
  btnOuter.disabled = !has;
}

// поточний шаблон з DOM
function getCurrentTemplate() {
  return document.querySelector('input[name="template"]:checked')?.value || null;
}

// слухач перемикання радіо
document.addEventListener('change', (e) => {
  if (e.target.name === 'template') {
    showForm(e.target.value); // ВАЖЛИВО: value має збігатись з класом форми
  }
});

// кнопки
const btnInner = document.getElementById('btnInner');
const btnOuter = document.getElementById('btnOuter');

btnInner.addEventListener('click', () => {
  const key = getCurrentTemplate();
  const fn = generators[key]?.inner;
  if (fn) fn(); else console.warn('Нема функції inner для шаблону:', key);
});

btnOuter.addEventListener('click', () => {
  const key = getCurrentTemplate();
  const fn = generators[key]?.outer;
  if (fn) fn(); else console.warn('Нема функції outer для шаблону:', key);
});

// ініціалізація
document.addEventListener('DOMContentLoaded', () => {
  const key = getCurrentTemplate();
  if (key) showForm(key);
});



function toPt(mm) {
    let result = mm * 2.83465
    return result
}

async function generateAssaAbloyInnerLablePDF() {
    const { jsPDF } = window.jspdf;

    // const mxp = 1287632
    // const projectName = "Alma Cruises\nAlma Cruises"
    // const productCode = "H-ALMACRU-0224"
    // const vesselName = "Some"
    // const assaPoSo = "PO 4500044551 / SO 5000066945"
    // const tlsOrder = "NL013031"
    const mxp = document.getElementById("mxp").value.toUpperCase()
    const projectName = document.getElementById("projectName").value
    const productCode = document.getElementById("productCode").value.toUpperCase()
    const vesselName = document.getElementById("vesselName").value
    const assaPoSo = document.getElementById("assaPoSo").value.toUpperCase()
    const tlsOrder = document.getElementById("tlsOrder").value.toUpperCase()
    const innerBoxQuantity = document.getElementById("innerBoxQuantity").value

    const logo = document.getElementById("logo")
    const image = new Image()
    image.src = "img/assa_logo.png"

    // Створюємо PDF: розміри 8 см x 5 см (1 см ≈ 28.346 pt)
    const doc = new jsPDF({
        unit: "pt",
        format: [toPt(80), toPt(50)], // 8x5 см
        orientation: "landscape",
    });

    const pageWidth = doc.internal.pageSize.getWidth()
    const maxTextWidth = pageWidth - toPt(6)

    doc.setFont("Arial", "normal")   
    doc.setFontSize(13)
    doc.text(`MXP# ${mxp}`, toPt(2), toPt(16))
    const wrappedText = doc.splitTextToSize(projectName, maxTextWidth)
    doc.setFont("Arial", "bold")
    doc.text(wrappedText, pageWidth / 2, toPt(21), {align: "center"})
    doc.setFont("Arial", "normal")
    doc.text(productCode, pageWidth / 2, toPt(32), {align: "center"})
    if (vesselName) {
        doc.text(`Vessel name: ${vesselName}`, toPt(2), toPt(37))
    }
    doc.text(assaPoSo, toPt(2), toPt(42))
    doc.setFont("Arial", "bold")
    doc.text(tlsOrder, toPt(2), toPt(47))
    doc.text(`${innerBoxQuantity} pcs.`, toPt(59), toPt(47))

    doc.addImage(image, "png", toPt(10), toPt(3), toPt(60), toPt(8))

    doc.save(`${tlsOrder}_${mxp}_Inner carton label.pdf`);
}

async function generateAssaAbloyOuterLablePDF() {
    const { jsPDF } = window.jspdf;

    const mxp = document.getElementById("mxp").value.toUpperCase()
    const projectName = document.getElementById("projectName").value
    const productCode = document.getElementById("productCode").value.toUpperCase()
    const vesselName = document.getElementById("vesselName").value
    const assaPoSo = document.getElementById("assaPoSo").value.toUpperCase()
    const tlsOrder = document.getElementById("tlsOrder").value.toUpperCase()

    const inBoxQuantity = parseInt(document.getElementById("outerBoxQuantity").value)
    const quantityInOrder = parseInt(document.getElementById("quantityInOrder").value)
    
    const fullBoxQuantity = Math.floor(quantityInOrder / inBoxQuantity)
    const remainedQuantity = quantityInOrder - (fullBoxQuantity * inBoxQuantity)
    const totalBoxes = remainedQuantity === 0 ? fullBoxQuantity : fullBoxQuantity + 1;

    const logo = document.getElementById("logo")
    const image = new Image()
    image.src = "img/assa_logo.png"

    // Створюємо PDF: розміри 10 см x 7.5 см (1 см ≈ 28.346 pt)
    const doc = new jsPDF({
        unit: "pt",
        format: [toPt(100), toPt(75)], // 10x7.5 см
        orientation: "landscape",
    });

    const pageWidth = doc.internal.pageSize.getWidth()
    const maxTextWidth = pageWidth - toPt(6)

    for (let i = 0; i < totalBoxes; i++) {
        const isLastPage = (i === totalBoxes - 1);
        const currentBoxQuantity = isLastPage && remainedQuantity !== 0 ? remainedQuantity : inBoxQuantity

        doc.setFont("Arial", "normal")   
        doc.setFontSize(17)
        doc.text(`MXP# ${mxp}`, toPt(3), toPt(22))
        const wrappedText = doc.splitTextToSize(projectName, maxTextWidth)
        doc.setFont("Arial", "bold")
        doc.setFontSize(18)
        doc.text(wrappedText, pageWidth / 2, toPt(29), {align: "center"})
        doc.setFont("Arial", "normal")
        doc.setFontSize(17)
        doc.text(productCode, pageWidth / 2, toPt(44), {align: "center"})
        if (vesselName) {
            doc.text(`Vessel name: ${vesselName}`, toPt(3), toPt(50))
        }
        doc.text(assaPoSo, toPt(3), toPt(57))
        doc.text(tlsOrder, toPt(3), toPt(64))
        doc.setFont("Arial", "bold")
        doc.setFontSize(18)
        doc.text(`Q-ty: ${currentBoxQuantity}`, toPt(3), toPt(71))

        doc.text(`${i+1}/${totalBoxes}`, toPt(85), toPt(71))
        doc.addImage(image, "png", toPt(3), toPt(3), toPt(94), toPt(12))
        
        if (i < totalBoxes - 1) {
            doc.addPage(); // Додає нову сторінку, крім останньої
        }
    }
    doc.save(`${tlsOrder}_${mxp}_Outer carton label.pdf`);
}

async function generateTlsInnerLablePDF(){}
async function generateTlsOuterLablePDF(){}
async function generateNclInnerLablePDF(){}
async function generateNclOuterLablePDF(){}

