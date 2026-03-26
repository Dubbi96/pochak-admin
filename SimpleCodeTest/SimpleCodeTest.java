import java.nio.ByteBuffer;
import java.nio.ByteOrder;

public class SimpleCodeTest {

    protected int getPersonaId() {
        byte personaId = (byte)0x01;
        return Byte.toUnsignedInt(personaId);
    }

    /**
     * 현재 컨텍스트에서 User ID를 가져와서 반환합니다.
     * <p>
     * 이 메서드는 컨텍스트에서 byte 배열 형태의 User ID를 가져오고,
     * 이를 long 형태로 변환하여 반환합니다.
     *
     * @return 현재 컨텍스트의 User ID를 나타내는 long 값
     */
    protected long getUserId() {
        byte[] userIdBytes = {(byte)0x8b, (byte)0x00, (byte)0x00, (byte)0x00, (byte)0x00, (byte)0x00, (byte)0x00};
        byte[] fullArray = new byte[8];
        fullArray[0] = 0;
        System.arraycopy(userIdBytes, 0, fullArray, 1, userIdBytes.length);
        return ByteBuffer.wrap(fullArray).order(ByteOrder.LITTLE_ENDIAN).getLong();
    }

    /**
     * 현재 컨텍스트의 SuperWorld ID를 계산하여 반환합니다.
     * <p>
     * 이 메서드는 현재 컨텍스트의 Persona ID와 User ID를 합산하여
     * SuperWorld ID를 계산합니다.
     *
     * @return 현재 컨텍스트의 SuperWorld ID를 나타내는 long 값
     */
    protected long getSuperWorldId() {
        return getPersonaId() + getUserId();
    }
    public static void main(String[] args) {
        SimpleCodeTest simpleCodeTest = new SimpleCodeTest();
        System.out.println(simpleCodeTest.getPersonaId());
        System.out.println(simpleCodeTest.getUserId());
        System.out.println(simpleCodeTest.getSuperWorldId());
    }
}
