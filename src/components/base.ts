export function newBoard(): ("X" | "O" | "")[][] {
    const list: ("X" | "O" | "")[][] = [];

    for (let i = 0; i < 15; i++) {
        const a: ("X" | "O" | "")[] = [];
        for (let j = 0; j < 15; j++) {
            a.push("");
        }

        list.push(a);
    }

    return list;
}

export function formatDate(d: Date): string {
    let formattedDate = `${d.getDate()}. `;

    switch (d.getMonth()) {
        case 0: // Nenavidim javascript, tohle je leden
            formattedDate = `${formattedDate}ledna`;
            break;
        case 1:
            formattedDate = `${formattedDate}února`;
            break;
        case 2:
            formattedDate = `${formattedDate}března`;
            break;
        case 3:
            formattedDate = `${formattedDate}dubna`;
            break;
        case 4:
            formattedDate = `${formattedDate}května`;
            break;
        case 5:
            formattedDate = `${formattedDate}června`;
            break;
        case 6:
            formattedDate = `${formattedDate}července`;
            break;
        case 7:
            formattedDate = `${formattedDate}srpna`;
            break;
        case 8:
            formattedDate = `${formattedDate}září`;
            break;
        case 9:
            formattedDate = `${formattedDate}října`;
            break;
        case 10:
            formattedDate = `${formattedDate}listopadu`;
            break;
        case 11:
            formattedDate = `${formattedDate}prosince`;
            break;
        default:
            formattedDate = `${formattedDate}${d.getMonth()}`; //Fallback
            break;
    }

    return `${formattedDate} ${d.getFullYear()} v ${d.getHours()}:${d.getMinutes()}`;
}
