package HyundaiCard;

import java.util.*;

public class StringTest {
    public static void main(String[] args) {
        String str = "hello my name is dubbi";
        System.out.println(str.trim());
        System.out.println(str.toLowerCase());
        System.out.println(str.toUpperCase());
        //Arrays.stream(str.split("")).forEach(System.out::println);
        System.out.println(str.compareTo("hell"));

        List<String> list = new ArrayList<>();
        List<String> otherList = List.of(new String[]{"A", "B", "C"});
        System.out.println(list.addAll(otherList));
        Arrays.stream(list.toArray()).forEach(System.out::println);
        list.set(0,"hello");
        Arrays.stream(list.toArray()).forEach(System.out::println);

        StringBuilder sb = new StringBuilder();
        sb.append("hello");
        sb.deleteCharAt(4);
        System.out.println(sb);

        // 문제 11
        List<Integer> list11 = new ArrayList<>(Arrays.asList(1, 2, 3, 4, 5));
        list11.removeIf(n -> n % 2 != 0);
        System.out.println(list11); // [2, 4]

        // 문제 12
        List<String> list12 = new ArrayList<>(Arrays.asList("a", "b", "c"));
        String[] array = list12.toArray(new String[0]);
        System.out.println(Arrays.toString(array)); // [a, b, c]

        // 문제 13
        List<Integer> list13 = new ArrayList<>(Arrays.asList(10, 20, 30, 40, 50));
        int maxValue = Collections.max(list13);
        System.out.println(maxValue); // 50

        // 문제 14
        List<Integer> list14 = new ArrayList<>(Arrays.asList(5, 3, 8, 1));
        Collections.sort(list14, Collections.reverseOrder());
        System.out.println(list14); // [8, 5, 3, 1]

        // 문제 15
        List<Integer> list15 = new ArrayList<>(Arrays.asList(1, 2, 3, 3, 3, 4, 5));
        int frequency = Collections.frequency(list15, 3);
        System.out.println(frequency); // 3

        // 문제 16
        List<Integer> list16 = new ArrayList<>(Arrays.asList(2, 4, 6, 8));
        int index = Collections.binarySearch(list16, 6);
        System.out.println(index); // 2

        Stack<Integer> stack = new Stack<>();
        stack.push(1);
        stack.push(2);
        System.out.println(stack.get(0));
    }
}
