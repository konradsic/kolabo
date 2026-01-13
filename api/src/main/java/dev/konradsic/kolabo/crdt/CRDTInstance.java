package dev.konradsic.kolabo.crdt;

import java.util.*;


// based on https://namvdo.ai/position-based-crdt-text-editor/
public class CRDTInstance {

    private Integer clock = 0;
    private final Map<UUID, Character> characters = new HashMap<>();
    private final Double BASE;
    private final String siteId;
    private double boundary = 10.0;

    public CRDTInstance(Double base, String siteId) {
        this.BASE = base;
        this.siteId = siteId;
    }

    private Integer incrementClock() {
        return ++clock;
    }

    private int comparePositions(Position pos1, Position pos2) {
        int len = Math.min(pos1.getIndex().size(), pos2.getIndex().size());

        for (int i=0; i<len; i++)
            if (!Objects.equals(pos1.getIndex().get(i), pos2.getIndex().get(i)))
                return Double.compare(pos1.getIndex().get(i), pos2.getIndex().get(i));

        if (pos1.getIndex().size() != pos2.getIndex().size())
            return Integer.compare(pos1.getIndex().size(), pos2.getIndex().size());

        if (!Objects.equals(pos1.getSiteId(), pos2.getSiteId()))
            return pos1.getSiteId().compareTo(pos2.getSiteId());

        return Integer.compare(pos1.getClock(), pos2.getClock());
    }

    private int compareCharacterPositions(Character c1, Character c2) {
        return comparePositions(c1.getPosition(), c2.getPosition());
    }

    public Map<UUID, Character> getCharacters() {
        return characters;
    }

    public String getSiteId() {
        return siteId;
    }

    public Double getBoundary() {
        return boundary;
    }

    public void setBoundary(double boundary) {
        this.boundary = boundary;
    }

    private List<Double> generatePositionBefore(List<Double> index) {
        if (index.get(0) <= boundary) return List.of(index.get(0) - 1);
        return List.of(index.get(0) - boundary);
    }

    private List<Double> generatePositionAfter(List<Double> index) {
        List<Double> newIndex = new ArrayList<>(index);
        newIndex.add(BASE);
        return newIndex;
    }

    public Position generatePositionBetween(Position prev, Position next, List<Double> newPos) {
        if (prev == null && next == null) return new Position(List.of(BASE), siteId, incrementClock());

        if (prev == null) {
            return new Position(
                generatePositionBefore(next.getIndex()),
                siteId,
                incrementClock()
            );
        }
        if (next == null) {
            return new Position(
                generatePositionAfter(prev.getIndex()),
                siteId,
                incrementClock()
            );
        }

        List<Double> prevIdx = prev.getIndex();
        List<Double> nextIdx = next.getIndex();

        // Find a common prefix
        int i = 0;
        while (i < prevIdx.size() && i < nextIdx.size()) {
            if (!Objects.equals(prevIdx.get(i), nextIdx.get(i))) break;

            newPos.add(prevIdx.get(i));
            i++;
        }

        Double prevDigit = (i < prevIdx.size()) ? prevIdx.get(i) : 0;
        Double nextDigit = (i < nextIdx.size()) ? nextIdx.get(i) : BASE;
        double diff = nextDigit - prevDigit;

        if (diff > 1) {
            newPos.add(prevDigit + Math.floor(diff / 2));
            return new Position(newPos, siteId, incrementClock());
        } else {
            newPos.add(prevDigit);
            return generatePositionBetween(
                new Position(prevIdx.subList(0,i+1), prev.siteId, prev.clock),
                new Position(nextIdx.subList(0,i+1), next.siteId, next.clock),
                newPos
            );
        }
    }

    public Character insert(String value, UUID prevId, UUID nextId) {
        Position pos = generatePositionBetween(
            prevId != null ? characters.get(prevId).getPosition() : null,
            nextId != null ? characters.get(nextId).getPosition() : null,
            List.of()
        );

        Character character = new Character(value, pos);
        characters.put(character.getId(), character);
        return character;
    }

    public void merge(CRDTInstance other) {
        // iterate over [id, char] of other.characters and merge
        for (Map.Entry<UUID, Character> entry : other.getCharacters().entrySet()) {
            if (!characters.containsKey(entry.getKey())) {
                characters.put(entry.getKey(), entry.getValue());
            } else {
                Character existing = characters.get(entry.getKey());
                if (comparePositions(entry.getValue().getPosition(), existing.getPosition()) > 0) {
                    characters.put(entry.getKey(), entry.getValue());
                }
            }
        }
    }

    public String extractText() {
        List<Character> characters = new ArrayList<>(this.characters.values())
            .stream()
            .filter(c -> !c.getMetadata().isDeleted())
            .sorted(this::compareCharacterPositions)
            .toList();
        StringBuilder sb = new StringBuilder();
        for (Character c : characters) {
            sb.append(c.getValue());
        }
        return sb.toString();
    }
}
