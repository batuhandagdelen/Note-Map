import { defaultIcon, visitIcon, JobIcon, homeIcon, parkIcon } from "./ui.js";

//!NOTE UN STATÜS ÜNE GÖRE MARKER I BELİRLEYECEK FONKSİYON

export function getNoteIcon(status) {
  switch (status) {
    case "Visit":
      return visitIcon;

    case "Home":
      return homeIcon;

    case "Job":
      return JobIcon;

    case "Park":
      return parkIcon;

    default:
      return defaultIcon;
  }
}

//!TARİH VERİSİNİ FORMATLAYAN FONKSİYON

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString("tr", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

//!STATUS DEĞERİNE GÖRE EKRANA RENDERLANACAK METNİ BELİRLE
export const getStatus = (status) => {
  switch (status) {
    case "Visit":
      return "Ziyaret";

    case "Park":
      return "Park yeri";

    case "Home":
      return "Ev";

    case "Job":
      return "İş";

    default:
      "Tanımsız";
  }
};
