export const SPREADSHEET_ID = '1XFekRulpsr52IpGB_0rIxIEOfyzxaOAlMCBVsZzfbTs';

export type SpreadSheetProps = {
	id: string;
	title: string;
};
export function getSheetData({ id, title }: SpreadSheetProps) {
	return fetch(`https://docs.google.com/spreadsheets/d/${id}/gviz/tq?sheet=${title}`, {
		mode: 'no-cors'
	}).then((res) => res.text());
}
