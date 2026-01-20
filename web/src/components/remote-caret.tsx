
interface RemoteCaretProps {
  offset: number;
  name: string;
  color: string;
  editorRef: React.RefObject<HTMLDivElement | null>;
}

const getCoordsFromOffset = (offset: number, editorRef: React.RefObject<HTMLDivElement | null>) => {
  if (!editorRef.current) return undefined;
  const range = document.createRange();
  let currentOffset = 0;
  let targetNode = null;
  let localOffset = 0;


  const walk = document.createTreeWalker(editorRef.current, NodeFilter.SHOW_TEXT, null);
  let node;
  while ((node = walk.nextNode())) {
    const len = node.textContent?.length ?? 0;
    if (currentOffset + len >= offset) {
      targetNode = node;
      localOffset = offset - currentOffset;
    }
    currentOffset += len;
  }
  if (!targetNode) return undefined;

  range.setStart(targetNode, localOffset);
  range.setEnd(targetNode, localOffset);

  const rect = range.getBoundingClientRect();
  return { x: rect.left, y: rect.top, h: rect.height };
}

export default function RemoteCaret({ offset, name, color, editorRef }: RemoteCaretProps) {
  const coords = getCoordsFromOffset(offset, editorRef);
  if (!coords) return null;

  return (<>
    <div style={{ position: "absolute", left: coords.x, top: coords.y - 12, padding: '2px 4px', backgroundColor: color, zIndex: 1000, borderRadius: '4px', pointerEvents: 'none', fontSize: '12px' }}>{name}</div> {/* handle */}
    <div style={{ position: "absolute", left: coords.x, top: coords.y, borderLeft: `2px solid ${color}`, zIndex: 1000, height: coords.h, pointerEvents: 'none' }}></div> {/* pointer */}
  </>)
}