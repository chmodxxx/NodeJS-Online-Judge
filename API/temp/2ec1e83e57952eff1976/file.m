#include <Foundation/Foundation.h>

@interface Test
+ (const char *) classStringValue;
@end

@implementation Test
+ (const char *) classStringValue;
{
    return "Hey!";
}
@end

int main(void)
{
    printf("%s\n", [Test classStringValue]);
    return 0;
}