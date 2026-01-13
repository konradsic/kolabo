package dev.konradsic.kolabo.crdt;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public class Position {
    List<Double> index;
    String siteId;
    int clock;

    @JsonCreator
    public Position(
        @JsonProperty("index") List<Double> index,
        @JsonProperty("siteId") String siteId,
        @JsonProperty("clock") int clock
    ) {
        this.index = index;
        this.siteId = siteId;
        this.clock = clock;
    }

    public List<Double> getIndex() { return index; }
    public String getSiteId() { return siteId; }
    public int getClock() { return clock; }

    public void setIndex(List<Double> index) { this.index = index; }
    public void setSiteId(String siteId) { this.siteId = siteId; }
    public void setClock(int clock) { this.clock = clock; }
}
