package com.pochak.common.security;

public class UserContextHolder {

    private static final ThreadLocal<UserContext> CONTEXT = new ThreadLocal<>();

    private UserContextHolder() {
    }

    public static void set(UserContext context) {
        CONTEXT.set(context);
    }

    public static UserContext get() {
        return CONTEXT.get();
    }

    public static void clear() {
        CONTEXT.remove();
    }

    public static Long getUserId() {
        UserContext ctx = get();
        return ctx != null ? ctx.getUserId() : null;
    }

    public static String getRole() {
        UserContext ctx = get();
        return ctx != null ? ctx.getRole() : null;
    }
}
