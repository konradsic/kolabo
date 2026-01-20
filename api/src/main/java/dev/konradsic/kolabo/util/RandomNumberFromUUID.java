package dev.konradsic.kolabo.util;

import java.util.SplittableRandom;
import java.util.UUID;

public class RandomNumberFromUUID {
    public static int generateInt(UUID uuid, int low, int high) {
        long seed = uuid.getMostSignificantBits() ^ uuid.getLeastSignificantBits();
        SplittableRandom rng = new SplittableRandom(seed);
        return rng.nextInt(high - low) + low;
    }
}
